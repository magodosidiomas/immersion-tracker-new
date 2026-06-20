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
