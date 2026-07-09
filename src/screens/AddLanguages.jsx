import { useEffect, useState } from 'react'
import { addLanguage, getLanguages } from '../db'
import { AVAILABLE_LANGUAGES } from '../data/availableLanguages'
import { normalizeForCompare } from '../utils/text'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import InputField from '../components/InputField'
import SelectableListItem from '../components/SelectableListItem'
import { Close, Check, Search } from '@nine-thirty-five/material-symbols-react/outlined'
import Flag from '../components/Flag'
import './AddLanguages.css'

// Reached from ManageLanguages' "Adicionar idiomas" button. Fetches the
// current language list itself (same self-sufficient-screen pattern as
// ManageLanguages/App) so AVAILABLE_LANGUAGES can be filtered down to
// languages not already added — no point offering to add a duplicate.
function AddLanguages({ onClose }) {
  const [existingNames, setExistingNames] = useState(null)
  const [selected, setSelected] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    getLanguages().then((languages) => setExistingNames(languages.map((language) => language.name)))
  }, [])

  if (existingNames === null) return null

  const options = AVAILABLE_LANGUAGES.filter((language) => !existingNames.includes(language.name))
  const filteredOptions = query.trim()
    ? options.filter((language) => normalizeForCompare(language.name).includes(normalizeForCompare(query)))
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

  return (
    <main className="add-languages">
      <TopNav
        title="Adicionar idiomas"
        hasDivider
        trailingRight={
          <button type="button" className="top-nav-icon-reset" onClick={onClose} aria-label="Fechar">
            <Close />
          </button>
        }
      />
      <div className="add-languages-scroll">
        <InputField
          placeholder="Buscar idioma"
          leadingIcon={<Search />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="add-languages-card">
          {filteredOptions.map((language, index) => {
            const isSelected = selected.includes(language.name)
            return (
              <SelectableListItem
                key={language.name}
                label={language.name}
                flag={<Flag code={language.flagCode} />}
                divider={index > 0}
                trailingIcon={
                  <span className="add-languages-checkbox">
                    <span className="add-languages-checkbox-box" data-checked={isSelected}>
                      {isSelected && <Check />}
                    </span>
                  </span>
                }
                onClick={() => toggle(language.name)}
              />
            )
          })}
        </div>
      </div>
      <div className="add-languages-footer">
        <Button leadingIcon={<Check />} disabled={selected.length === 0} fullWidth onClick={handleAdd}>
          Adicionar ({selected.length})
        </Button>
      </div>
    </main>
  )
}

export default AddLanguages
