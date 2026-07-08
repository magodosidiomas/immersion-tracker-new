import { useState } from 'react'

// Search (title/subtitle substring) + type filter (single-select:
// picking a type replaces any previous selection; picking the same
// type again clears it back to "Todos") + grouping by the
// already-computed `dateLabel`. Shared by Library and LinkContent
// since both show the same filtered/grouped content list, just
// inside different chrome.
export function useContentFilter(items) {
  const [query, setQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState([])

  function toggleType(key) {
    setSelectedTypes((current) => (current.includes(key) ? [] : [key]))
  }

  const trimmedQuery = query.trim().toLowerCase()
  const filtered = items.filter((item) => {
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type)
    const matchesQuery =
      !trimmedQuery ||
      item.title?.toLowerCase().includes(trimmedQuery) ||
      item.subtitle?.toLowerCase().includes(trimmedQuery)
    return matchesType && matchesQuery
  })

  const groups = []
  for (const item of filtered) {
    const group = groups.find((g) => g.label === item.dateLabel)
    if (group) group.items.push(item)
    else groups.push({ label: item.dateLabel, items: [item] })
  }

  return { query, setQuery, selectedTypes, toggleType, setSelectedTypes, groups }
}
