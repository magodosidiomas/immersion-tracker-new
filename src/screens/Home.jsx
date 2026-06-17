import { useEffect, useState } from 'react'
import { getLanguages, getAppSettings, setActiveLanguageId } from '../db'
import TopNav from '../components/TopNav'
import BottomSheet from '../components/BottomSheet'
import SelectableListItem from '../components/SelectableListItem'
import { Settings, Check } from '@nine-thirty-five/material-symbols-react/outlined'
import './Home.css'

// First real screen after onboarding. For now it's just the app shell —
// the top nav (active language + switcher + settings entry point) with
// an empty body. Real homepage content (timer, streak, etc.) gets built
// next, screen by screen from Figma.
//
// The switcher picks from already-added languages (getLanguages), not
// AVAILABLE_LANGUAGES — that catalog is only for adding a new language,
// a flow that lives in Settings, not here. Tapping a row switches and
// closes immediately, no Save/Cancel: this is a quick swap of what's
// already active, not a form.
function Home({ onOpenSettings }) {
  const [languages, setLanguages] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [switcherOpen, setSwitcherOpen] = useState(false)

  useEffect(() => {
    Promise.all([getLanguages(), getAppSettings()]).then(([langs, settings]) => {
      setLanguages(langs)
      setActiveId(settings.activeLanguageId)
    })
  }, [])

  const activeLanguage = languages.find((language) => language.id === activeId)

  async function handlePick(language) {
    setSwitcherOpen(false)
    if (language.id === activeId) return
    setActiveId(language.id)
    await setActiveLanguageId(language.id)
  }

  return (
    <main className="home">
      <TopNav
        title={activeLanguage?.name}
        flag={activeLanguage?.flagEmoji}
        hasDropdown
        hasDivider
        onDropdownClick={() => setSwitcherOpen(true)}
        trailingRight={
          <button
            type="button"
            className="top-nav-icon-reset"
            onClick={onOpenSettings}
            aria-label="Configurações"
          >
            <Settings />
          </button>
        }
      />
      <BottomSheet
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        title="Idioma"
        description="Escolha o idioma ativo."
      >
        {languages.map((language, index) => (
          <SelectableListItem
            key={language.id}
            label={language.name}
            flag={language.flagEmoji}
            selected={language.id === activeId}
            trailingIcon={language.id === activeId ? <Check /> : null}
            divider={index < languages.length - 1}
            onClick={() => handlePick(language)}
          />
        ))}
      </BottomSheet>
    </main>
  )
}

export default Home
