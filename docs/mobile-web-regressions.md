# Why web work keeps breaking mobile (and how to stop it)

## Root cause

Almost every screen in this app has **two independent shells sharing one
data hook**: a mobile full-screen version and a desktop windowed/sidebar
version (e.g. `AddLanguages` + `AddLanguagesWindow`, `Settings` +
`SettingsWindow`). They're separate JSX/CSS files by design (see
`imerso-guidelines.md`), which is good — but it means:

- A fix applied to one shell (e.g. "AddLanguages: fix list scroll") does
  **nothing** for its sibling shell unless applied twice. This is exactly
  how the scroll bug shipped for `AddLanguagesWindow` after
  `AddLanguages.jsx` had already been fixed.
- A shared component (`InputField`, `SelectableListItem`, etc.) used by
  both shells can be edited to fix one shell's usage and silently break
  the other, because the two call sites often pass different props.

## Checklist before shipping any fix framed as "web" or "mobile"

1. **Grep for the sibling shell.** If the file you're editing is a
   screen (not a shared component), check whether a `*Window.jsx`
   counterpart exists (`grep -l "Window" src/components`) or vice versa.
   If a bug is reported on one, assume it may also exist on the other
   until checked.
2. **Grep for every usage of a shared component before changing its
   prop handling.** `grep -rn "ComponentName" src --include=*.jsx`. A
   prop that behaves fine in caller A can silently break caller B (see
   `InputField`'s `className` bug: `{...props}` spread after a hardcoded
   `className` let one caller's `className` overwrite the input's own
   styling class — the other 15+ callers never passed `className`, so
   it was invisible until AddLanguages did).
3. **Never let `{...props}` land after a hardcoded prop of the same
   name.** If a component hardcodes `className`, `style`, or similar on
   an inner element, destructure that prop explicitly instead of
   spreading `...props` after it.
4. **Scroll containers: one flex:1 `overflow-y: auto` child per screen,
   full stop.** Nav bars / headers / search fields are `flex-shrink: 0`
   siblings. Never make the outer screen wrapper itself the scroll
   container — every screen that did this needed a rewrite later
   (`SelectLanguage`, `AddLanguagesWindow`). See `EdgeScrollbar.jsx`'s
   own doc comment for the convention it depends on.
5. **State the breakpoint you're changing.** Desktop is `>= 1280px`
   (`Sidebar.css`, `index.css`). Before editing a screen, note in the
   commit/PR whether the change is inside a `@media (min-width: 1280px)`
   block, a desktop-only file (`*Window.jsx`), or shared — and confirm
   the other side wasn't touched unintentionally.
6. **Test both shells when the bug report doesn't specify.** If someone
   says "the list doesn't scroll" without saying which device, check
   mobile *and* desktop before calling it fixed — they're different DOM
   trees with different CSS files.

## Divider/list rule (recap, see `list-divider-standard.md`)

Same root cause applies here too: a divider or scroll fix applied to
one shell's markup doesn't propagate to its sibling. Always check both.
