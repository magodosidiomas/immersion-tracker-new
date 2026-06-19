import { useState } from 'react'
import { addLanguage } from '../db'
import { AVAILABLE_LANGUAGES } from '../data/availableLanguages'
import SelectableListItem from '../components/SelectableListItem'
import Flag from '../components/Flag'
import './SelectLanguage.css'

// First screen: pick a language to start tracking. Tapping a row both
// creates the language (which becomes active automatically, since it's
// the first one — see addLanguage in db/index.js) and advances straight
// to Home. No "Continue" button and no persisted selected state: the
// Figma spec hides the check-icon slot on every row here, unlike the
// future Settings list where the active language stays visible after
// picking. The subtitle already tells people more languages can be
// added later, so this screen stays a single tap.
//
// `preview` (used by App.jsx's #onboarding route) skips the real
// addLanguage() write so the screen can be visited and tapped
// repeatedly without creating languages in IndexedDB.
function SelectLanguage({ onSelect, preview = false }) {
  const [pending, setPending] = useState(false)

  async function handleSelect(language) {
    if (pending) return
    setPending(true)
    if (preview) {
      onSelect(language)
      setPending(false)
      return
    }
    const created = await addLanguage(language)
    onSelect(created)
  }

  return (
    <main className="select-language">
      <div className="select-language-content">
        <div className="select-language-header">
          <h1 className="select-language-title">Qual idioma você está aprendendo?</h1>
          <p className="select-language-subtitle">Você pode adicionar outros idiomas depois.</p>
        </div>
        <div className="select-language-card">
          {AVAILABLE_LANGUAGES.map((language, index) => (
            <SelectableListItem
              key={language.name}
              label={language.name}
              flag={<Flag code={language.flagCode} />}
              divider={index > 0}
              disabled={pending}
              onClick={() => handleSelect(language)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default SelectLanguage
