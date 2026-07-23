import { useEffect, useState } from 'react'
import { addLanguage, getLanguages } from '../db'
import { AVAILABLE_LANGUAGES } from '../data/availableLanguages'
import { normalizeForCompare } from '../utils/text'

// Shared data/selection logic behind AddLanguages (mobile full-screen)
// and AddLanguagesWindow (desktop modal) — same behavior, two different
// shells, so the fetch/filter/toggle/save logic lives in one place.
export function useAddLanguages(onClose) {
  const [existingNames, setExistingNames] = useState(null)
  const [selected, setSelected] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getLanguages().then((languages) => setExistingNames(languages.map((language) => language.name)))
  }, [])

  const options = existingNames === null ? [] : AVAILABLE_LANGUAGES.filter((language) => !existingNames.includes(language.name))
  const filteredOptions = query.trim()
    ? options.filter((language) => {
        const needle = normalizeForCompare(query)
        return (
          normalizeForCompare(language.name).includes(needle) ||
          normalizeForCompare(language.nativeName).includes(needle)
        )
      })
    : options

  function toggle(name) {
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]))
  }

  async function handleAdd() {
    const toAdd = options.filter((language) => selected.includes(language.name))
    for (const language of toAdd) {
      await addLanguage(language)
    }
    onClose()
  }

  return { loaded: existingNames !== null, filteredOptions, selected, query, setQuery, toggle, handleAdd }
}
