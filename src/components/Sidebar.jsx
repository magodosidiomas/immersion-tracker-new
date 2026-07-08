import { useEffect, useState } from 'react'
import './Sidebar.css'
import { getLanguages, getAppSettings, setActiveLanguageId } from '../db'
import Dropdown from './Dropdown'
import BottomSheet from './BottomSheet'
import SelectableListItem from './SelectableListItem'
import Button from './Button'
import Flag from './Flag'
import {
  Add,
  Settings,
  Check,
  Home as HomeIcon,
  BarChart,
  Book,
} from '@nine-thirty-five/material-symbols-react/outlined'

// Desktop-only sidebar (hidden below the desktop breakpoint via CSS —
// see Sidebar.css). Mirrors the Figma "Frame 85" nav: language
// switcher, "Nova sessão", the three main destinations, and
// Configurações pinned to the bottom. Owns the same language-switcher
// logic as LanguageTopNav (fetch languages/active id, switch on pick)
// since it's a different trigger shape (Dropdown, not TopNav) — not
// worth abstracting for one extra caller.
function Sidebar({ activeScreen, onNavigate, onOpenNewSession, onOpenManageLanguages, onOpenAddLanguages, onOpenSettings }) {
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

  function handleAddLanguages() {
    setSwitcherOpen(false)
    onOpenAddLanguages()
  }

  const navItems = [
    { key: 'home', label: 'Home', icon: <HomeIcon /> },
    { key: 'stats', label: 'Estatísticas', icon: <BarChart /> },
    { key: 'library', label: 'Biblioteca', icon: <Book /> },
  ]

  return (
    <nav className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-language">
          <Dropdown
            label={activeLanguage?.name}
            flag={activeLanguage && <Flag code={activeLanguage.flagCode} />}
            onClick={() => setSwitcherOpen(true)}
          />
        </div>
        <div className="sidebar-divider" />
        <div className="sidebar-actions">
          <Button leadingIcon={<Add />} fullWidth onClick={onOpenNewSession}>
            Nova sessão
          </Button>
          <div className="sidebar-nav-group">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className="sidebar-item"
                data-active={activeScreen === item.key}
                onClick={() => onNavigate(item.key)}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="sidebar-item"
        data-active={activeScreen === 'settings'}
        onClick={onOpenSettings}
      >
        <span className="sidebar-item-icon"><Settings /></span>
        <span className="sidebar-item-label">Configurações</span>
      </button>
      <BottomSheet
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        title="Idioma"
        description="Escolha o idioma ativo."
        primaryButton={
          <Button variant="outline" leadingIcon={<Add />} onClick={handleAddLanguages}>
            Adicionar idiomas
          </Button>
        }
        secondaryButton={
          <Button variant="ghost" leadingIcon={<Settings />} onClick={handleManageLanguages}>
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
    </nav>
  )
}

export default Sidebar
