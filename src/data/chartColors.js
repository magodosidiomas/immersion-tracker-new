// Primitives — raw sequential color ramps for data visualization. Generic,
// not tied to any taxonomy. Step 0 is the most saturated tone (used for
// totals); later steps lighten for nested breakdowns.
const CHART_PRIMITIVES = {
  violet: ['#8d6af5', '#a086ed', '#b19ee7', '#c0b3e5'],
  teal: ['#5dcaa5', '#7acaaf', '#93cbb8', '#aacfc2'],
  amber: ['#f59e42', '#eaac69', '#e4b88a', '#e1c5a7'],
  pink: ['#f2629e', '#ea82ad', '#e794b6', '#e5a5bf', '#e4b4c8'],
}

// Tokens — semantic layer that data-vis components actually consume.
// Indirects to a primitive so the chart system can be retargeted later
// (e.g. once formal Figma Variables exist) without touching callers.
export const CHART_COLORS = {
  'data-violet': CHART_PRIMITIVES.violet,
  'data-teal': CHART_PRIMITIVES.teal,
  'data-amber': CHART_PRIMITIVES.amber,
  'data-pink': CHART_PRIMITIVES.pink,
}
