import { useEffect, useState } from 'react'
import { addLanguage, getLanguages } from '../db'
import { AVAILABLE_LANGUAGES } from '../data/availableLanguages'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import SelectableListItem from '../components/SelectableListItem'
import { Close, Check } from '@nine-thirty-five/material-symbols-react/outlined'
import Flag from '../components/Flag'
import './AddLanguages.css'

// Reached from ManageLanguages' "Adicionar idiomas" button. Fetches the
// current language list itself (same self-sufficient-screen pattern as
// ManageLanguages/App) so AVAILABLE_LANGUAGES can be filtered down to
// languages not already added — no point offering to add a duplicate.
//
// The Figma spec includes a "Procurar idioma" search field at the top;
// it's intentionally left out for now. Whether that becomes an
// InputField or its own component is still an open decision, so this
// screen ships without search until that's settled, rather than
// guessing at the wrong abstraction.
function AddLanguages({ onClose }) {
  const [existingNames, setExistingNames] = useState(null)
  const [selected, setSelected] = useState([])

  useEffect(() => {
    getLanguages().then((languages) => setExistingNames(languages.map((language) => language.name)))
  }, [])

  if (existingNames === null) return null

  const options = AVAILABLE_LANGUAGES.filter((language) => !existingNames.includes(language.name))

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
        <div className="add-languages-card">
          {options.map((language, index) => {
            const isSelected = selected.includes(language.name)
            return (
              <SelectableListItem
                key={language.name}
                label={language.name}
                flag={<Flag code={language.flagCode} />}
                divider={index < options.length - 1}
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
