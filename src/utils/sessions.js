import { CATEGORIES } from '../data/categories'

// Resolves a category+subcategory key pair to their display labels.
// Returns { categoryLabel, subcategoryLabel } — subcategoryLabel is
// null when the subcategory key isn't found or wasn't provided.
// Shared by any screen that needs to show a live timer's selection
// (Home, NewSession) without re-implementing the same find() chain.
export function getCategoryLabel(categoryKey, subcategoryKey) {
  const category = CATEGORIES.find((item) => item.key === categoryKey)
  const subcategory = category?.subcategories.find((item) => item.key === subcategoryKey)
  return {
    categoryLabel: category?.label ?? null,
    subcategoryLabel: subcategory?.label ?? null,
  }
}

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

// Newest day first, newest session within a day first. Groups by the
// stored `date` string — 'YYYY-MM-DD' lexicographic order is also
// chronological, so no Date parsing is needed just to sort.
// Shared by Home and DayHistory (and any future screen that lists sessions).
export function groupSessionsByDate(sessions) {
  const groups = []
  for (const session of sessions) {
    let group = groups.find((g) => g.date === session.date)
    if (!group) {
      group = { date: session.date, sessions: [] }
      groups.push(group)
    }
    group.sessions.push(session)
  }
  groups.sort((a, b) => (a.date < b.date ? 1 : -1))
  for (const group of groups) {
    group.sessions.sort((a, b) => (a.startTime < b.startTime ? 1 : -1))
  }
  return groups
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
