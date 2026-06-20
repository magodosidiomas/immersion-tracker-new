import { useEffect, useState } from 'react'
import { getLanguages, getAppSettings, setActiveLanguageId } from '../db'
import TopNav from './TopNav'
import BottomSheet from './BottomSheet'
import SelectableListItem from './SelectableListItem'
import Button from './Button'
import Flag from './Flag'
import { Settings, Check } from '@nine-thirty-five/material-symbols-react/outlined'

// Shared between the two main tabs (Home, Statistics) — both show the
// same active-language switcher up top. Owns its own languages/activeId
// fetch so each screen doesn't repeat it; `onActiveLanguageChange`
// reports the resolved id upward for screens that need it to fetch
// their own per-language data (e.g. Home's sessions).
//
// The switcher picks from already-added languages (getLanguages), not
// AVAILABLE_LANGUAGES — that catalog is only for adding a new language,
// a flow that lives in Settings > Gerenciar idiomas. Tapping a row
// switches and closes immediately, no Save/Cancel: this is a quick
// swap of what's already active, not a form. The sheet's primaryButton
// is a shortcut straight into that same management screen.
function LanguageTopNav({ onOpenSettings, onOpenManageLanguages, onActiveLanguageChange }) {
  const [languages, setLanguages] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [switcherOpen, setSwitcherOpen] = useState(false)

  useEffect(() => {
    Promise.all([getLanguages(), getAppSettings()]).then(([langs, settings]) => {
      setLanguages(langs)
      setActiveId(settings.activeLanguageId)
    })
  }, [])

  useEffect(() => {
    onActiveLanguageChange?.(activeId)
  }, [activeId, onActiveLanguageChange])

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
    <>
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
            divider={index > 0}
            onClick={() => handlePick(language)}
          />
        ))}
      </BottomSheet>
    </>
  )
}

export default LanguageTopNav
