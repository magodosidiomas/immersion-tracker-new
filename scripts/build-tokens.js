// Reads the full Figma export (design-tokens/figma-export.json) and
// generates two files from it:
//   - src/styles/tokens.css    <- the "primitives" collection (raw color/
//                                  spacing/font-family scale)
//   - src/styles/semantic.css  <- the "tokens" collection (named values
//                                  like "surface primary" that alias the
//                                  primitives — this used to be hand-typed,
//                                  now it's generated the same way)
//
// Re-run this any time figma-export.json is replaced with a fresh export
// — don't hand-edit either output file.
//
// What this does NOT cover yet: the "_styles" collection (Figma Text
// Styles — font-weight/line-height/letter-spacing per named scale like
// "label/medium/medium"). Those aren't bound to Variables in Figma, so
// there's nothing to resolve automatically. They're hand-maintained in
// src/styles/typescale.css, added one at a time as components need them.
//
// Usage: npm run tokens

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const INPUT_PATH = join(__dirname, '../design-tokens/figma-export.json')
const TOKENS_OUTPUT_PATH = join(__dirname, '../src/styles/tokens.css')
const SEMANTIC_OUTPUT_PATH = join(__dirname, '../src/styles/semantic.css')

const warnings = []

function sanitize(key) {
  return key
    .toLowerCase()
    .replace(/%/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---------------------------------------------------------------------
// Primitives collection -> tokens.css
// ---------------------------------------------------------------------

// The new export already bakes alpha into an 8-digit hex (#RRGGBBAA),
// which is valid CSS on its own (Color Module 4, supported everywhere
// this app targets) — no rgba() conversion needed like the old format
// required.
function primitiveLine(leafKey, token, topCategory) {
  if (token.$type === 'color' && topCategory === 'color') {
    const varName = `color-${sanitize(leafKey)}`
    return { varName, css: `  --${varName}: ${token.$value.hex};` }
  }

  if (token.$type === 'float' && topCategory === 'spacing') {
    const varName = `space-${token.$value}`
    return { varName, css: `  --${varName}: ${token.$value}px;` }
  }

  if (token.$type === 'string' && topCategory === 'font-family') {
    const varName = `font-${sanitize(leafKey.replace(/^font-family-/, ''))}`
    return { varName, css: `  --${varName}: '${token.$value}', sans-serif;` }
  }

  return null
}

// Walks the primitives tree, pushing CSS lines into ctx.lines and
// recording every leaf's dotted path (e.g. "color.purple-dark.purple-900")
// so the semantic pass below can resolve aliases that point back at it.
function walkPrimitives(node, topCategory, path, ctx) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue
    const nextPath = [...path, key]

    if (value && typeof value === 'object' && '$type' in value) {
      const result = primitiveLine(key, value, topCategory)
      if (result) {
        ctx.lines.push(result.css)
        ctx.pathMap[nextPath.join('.')] = result.varName
      } else {
        warnings.push(
          `Skipped "${nextPath.join('.')}" — type "${value.$type}" doesn't match its category "${topCategory}".`
        )
      }
    } else if (value && typeof value === 'object') {
      walkPrimitives(value, topCategory, nextPath, ctx)
    }
  }
}

// ---------------------------------------------------------------------
// Tokens (semantic) collection -> semantic.css
// ---------------------------------------------------------------------

// Figma nests these under "spacing", but they're conceptually their own
// thing — the same instinct that was already baked into the hand-written
// "--radius-medium" (not "--spacing-border-radius-medium") before this
// was automated. Extended the same treatment to "button" for consistency.
const GROUP_REMAP = {
  'spacing.border-radius': 'radius',
  'spacing.button': 'button',
}

// Builds the CSS variable name for a semantic token from its path,
// e.g. (topCategory: "color", segments: ["icon", "muted-gray"]) ->
// "color-icon-muted-gray". Two things make this match what was
// previously hand-written: the group remap above, and collapsing
// adjacent duplicate words — without that, "font-size.label.label-medium"
// would become "font-size-label-label-medium" instead of the expected
// "font-size-label-medium" (the leaf name already repeats its own group).
function semanticVarName(topCategory, segments) {
  const remapKey = `${topCategory}.${segments[0]}`
  let category = topCategory
  let rest = segments
  if (GROUP_REMAP[remapKey]) {
    category = GROUP_REMAP[remapKey]
    rest = segments.slice(1)
  }

  const words = [category, ...rest]
    .flatMap((segment) => sanitize(segment).split('-'))
    .filter(Boolean)
  const deduped = words.filter((word, i) => word !== words[i - 1])
  return deduped.join('-')
}

// First pass: just record every semantic leaf's path -> var name, before
// resolving any values. Needed because semantic tokens can alias other
// semantic tokens (e.g. "text.on-inverse-accent" -> "{bg.surface.primary}"),
// and that target might appear later in iteration order.
function collectSemanticPaths(node, topCategory, path, pathMap) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue
    const nextPath = [...path, key]

    if (value && typeof value === 'object' && '$type' in value) {
      pathMap[nextPath.join('.')] = semanticVarName(topCategory, nextPath.slice(1))
    } else if (value && typeof value === 'object') {
      collectSemanticPaths(value, topCategory, nextPath, pathMap)
    }
  }
}

// Every semantic token's $value is an alias string like
// "{color.purple-dark.purple-900}". $collectionName says which collection
// it points into, so there's no need to guess between the two.
function resolveAlias(token, fullPath, primPathMap, tokenPathMap) {
  const match = /^\{(.+)\}$/.exec(token.$value)
  if (!match) {
    warnings.push(`"${fullPath}" has a literal (non-alias) value: ${JSON.stringify(token.$value)} — emitted as-is, worth double-checking.`)
    return token.$value
  }

  const aliasPath = match[1]
  const map = token.$collectionName === 'tokens' ? tokenPathMap : primPathMap
  const varName = map[aliasPath]
  if (!varName) {
    warnings.push(`"${fullPath}" references "${aliasPath}" (collection: ${token.$collectionName}), which wasn't found. Skipped.`)
    return null
  }
  return `var(--${varName})`
}

function buildSemanticLines(node, topCategory, path, ctx) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue
    const nextPath = [...path, key]

    if (value && typeof value === 'object' && '$type' in value) {
      const fullPath = nextPath.join('.')
      const varName = semanticVarName(topCategory, nextPath.slice(1))
      const resolved = resolveAlias(value, fullPath, ctx.primPathMap, ctx.tokenPathMap)
      if (resolved != null) {
        ctx.lines.push(`  --${varName}: ${resolved};`)
      }
    } else if (value && typeof value === 'object') {
      buildSemanticLines(value, topCategory, nextPath, ctx)
    }
  }
}

// ---------------------------------------------------------------------
// Shared: catches names that look like an accidental duplicate from
// Figma (e.g. "red-900 2", which usually means someone created a
// variable with a name that already existed and Figma appended " 2").
// ---------------------------------------------------------------------

function checkForSuspiciousNames(node, path) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue

    if (/\s\d+$/.test(key)) {
      warnings.push(
        `"${[...path, key].join('.')}" looks like an accidental duplicate from Figma (name ends in " <number>"). Worth checking/renaming at the source.`
      )
    }

    if (value && typeof value === 'object' && !('$type' in value)) {
      checkForSuspiciousNames(value, [...path, key])
    }
  }
}

function buildGroupedLines(root, walkFn, ctx) {
  for (const [category, value] of Object.entries(root)) {
    if (category.startsWith('$')) continue
    const before = ctx.lines.length
    walkFn(value, category, [category], ctx)
    if (ctx.lines.length > before) {
      ctx.lines.splice(before, 0, `  /* ${category} */`)
    }
  }
}

// ---------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------

const raw = JSON.parse(readFileSync(INPUT_PATH, 'utf-8'))
const primitivesCollection = raw.find((c) => c.primitives)?.primitives
const tokensCollection = raw.find((c) => c.tokens)?.tokens

if (!primitivesCollection || !tokensCollection) {
  throw new Error('Expected figma-export.json to contain both a "primitives" and a "tokens" collection.')
}

const primitivesRoot = primitivesCollection.modes['Mode 1']
const tokensRoot = tokensCollection.modes['Mode 1']

const primCtx = { lines: [], pathMap: {} }
buildGroupedLines(primitivesRoot, walkPrimitives, primCtx)

const tokenPathMap = {}
for (const [category, value] of Object.entries(tokensRoot)) {
  if (category.startsWith('$')) continue
  collectSemanticPaths(value, category, [category], tokenPathMap)
}

const semCtx = { lines: [], primPathMap: primCtx.pathMap, tokenPathMap }
buildGroupedLines(tokensRoot, buildSemanticLines, semCtx)

checkForSuspiciousNames(primitivesRoot, ['primitives'])
checkForSuspiciousNames(tokensRoot, ['tokens'])

const tokensOutput = `/* AUTO-GENERATED by scripts/build-tokens.js — do not edit by hand.
   Source: design-tokens/figma-export.json ("primitives" collection)
   Regenerate with: npm run tokens */

:root {
${primCtx.lines.join('\n')}
}
`

const semanticOutput = `/* AUTO-GENERATED by scripts/build-tokens.js — do not edit by hand.
   Source: design-tokens/figma-export.json ("tokens" collection)
   Regenerate with: npm run tokens

   Font-weight/line-height/letter-spacing aren't here — they're not bound
   to Figma Variables yet, so there's nothing to generate. See
   src/styles/typescale.css for those. */

:root {
${semCtx.lines.join('\n')}
}
`

mkdirSync(dirname(TOKENS_OUTPUT_PATH), { recursive: true })
writeFileSync(TOKENS_OUTPUT_PATH, tokensOutput)
writeFileSync(SEMANTIC_OUTPUT_PATH, semanticOutput)

console.log(`Wrote ${TOKENS_OUTPUT_PATH}`)
console.log(`Wrote ${SEMANTIC_OUTPUT_PATH}`)
if (warnings.length) {
  console.log('\nWarnings:')
  warnings.forEach((w) => console.log(' - ' + w))
}
