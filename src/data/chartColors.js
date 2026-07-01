// Primitives — raw sequential color ramps for data visualization. Generic,
// not tied to any taxonomy. Step 0 is the most saturated tone (used for
// totals); later steps lighten for nested breakdowns.
const CHART_PRIMITIVES = {
  violet: ['#8d6af5', '#ad95f7', '#c7b8f5', '#ddd3f7'],
  teal: ['#5dcaa5', '#8ad9bd', '#b0e5d1', '#cfeee0'],
  amber: ['#f59e42', '#f7b96e', '#f9d29b', '#fbe3c0'],
  pink: ['#f2629e', '#f593b8', '#f7b8cd', '#fad4dd', '#fce7ec'],
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
