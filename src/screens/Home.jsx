import { useEffect, useState } from 'react'
import { getLanguages, getAppSettings, setActiveLanguageId } from '../db'
import TopNav from '../components/TopNav'
import BottomSheet from '../components/BottomSheet'
import SelectableListItem from '../components/SelectableListItem'
import Button from '../components/Button'
import { Settings, Check } from '@nine-thirty-five/material-symbols-react/outlined'
import Flag from '../components/Flag'
import './Home.css'

// First real screen after onboarding. For now it's just the app shell —
// the top nav (active language + switcher + settings entry point) with
// an empty body. Real homepage content (timer, streak, etc.) gets built
// next, screen by screen from Figma.
//
// The switcher picks from already-added languages (getLanguages), not
// AVAILABLE_LANGUAGES — that catalog is only for adding a new language,
// a flow that lives in Settings > Gerenciar idiomas. Tapping a row
// switches and closes immediately, no Save/Cancel: this is a quick
// swap of what's already active, not a form. The sheet's primaryButton
// is a shortcut straight into that same management screen.
function Home({ onOpenSettings, onOpenManageLanguages }) {
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

  function handleManageLanguages() {
    setSwitcherOpen(false)
    onOpenManageLanguages()
  }

  return (
    <main className="home">
      <TopNav
        title={activeLanguage?.name}
        flag={activeLanguage && <Flag code={activeLanguage.flagCode} />}
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
        primaryButton={
          <Button variant="outline" leadingIcon={<Settings />} onClick={handleManageLanguages}>
            Gerenciar idiomas
          </Button>
        }
      >
        {languages.map((language, index) => (
          <SelectableListItem
            key={language.id}
            label={language.name}
            flag={<Flag code={language.flagCode} />}
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
