import { CATEGORIES } from '../data/categories'

// "Imersão · Escuta" — category/subcategory key→label lookup, shared
// by every screen that lists Session rows (Home's history, DayHistory).
export function sessionLabel(session) {
  const category = CATEGORIES.find((item) => item.key === session.category)
  const subcategory = category?.subcategories.find((item) => item.key === session.subcategory)
  if (!category) return '—'
  return subcategory ? `${category.label} · ${subcategory.label}` : category.label
}

// "1h 16m 24s" / "32m 15s" / "15m 20s" — each unit only shows once
// it's non-zero reading top-down, matching the Figma copy (no leading
// "0h" on a 32-minute session).
export function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

// "2h 11m" / "2h" / "11m" — same top-down "only show non-zero units"
// rule as formatDuration, but rounded to the minute and with no
// seconds unit at all. For rollups (DataCard and other stat totals)
// where second-level precision is just noise.
export function formatDurationShort(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  return `${m}m`
}

// Sessions -> DataCard's groups/items shape, one group per category in
// taxonomy order. Categories/subcategories with no sessions yet still
// show up at 0s/0% rather than disappearing, so the card's shape
// doesn't jump around as the first sessions of a new category land.
export function categoryBreakdown(sessions) {
  return CATEGORIES.map((category) => {
    const categorySessions = sessions.filter((session) => session.category === category.key)
    const items = category.subcategories.map((sub) => ({
      key: sub.key,
      label: sub.label,
      totalSeconds: categorySessions
        .filter((session) => session.subcategory === sub.key)
        .reduce((sum, session) => sum + session.durationSeconds, 0),
    }))
    return {
      key: category.key,
      label: category.label,
      colorRamp: category.colorRamp,
      totalSeconds: items.reduce((sum, item) => sum + item.totalSeconds, 0),
      items,
    }
  })
}
