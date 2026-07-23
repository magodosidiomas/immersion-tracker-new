import { useEffect, useRef, useState } from 'react'
import './Sidebar.css'
import { getLanguages, getAppSettings, setActiveLanguageId } from '../db'
import Dropdown from './Dropdown'
import SelectableListItem from './SelectableListItem'
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
function Sidebar({ activeScreen, onNavigate, onOpenManageLanguages, onOpenAddLanguages, onOpenSettings }) {
  const [languages, setLanguages] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const languageMenuRef = useRef(null)

  useEffect(() => {
    Promise.all([getLanguages(), getAppSettings()]).then(([langs, settings]) => {
      setLanguages(langs)
      setActiveId(settings.activeLanguageId)
    })
  }, [])

  // Desktop menu closes on outside click, unlike the mobile BottomSheet
  // this replaces (which had its own scrim). mousedown rather than
  // click so it beats the dropdown trigger's own click-to-toggle.
  useEffect(() => {
    if (!switcherOpen) return
    function handlePointerDown(event) {
      if (languageMenuRef.current?.contains(event.target)) return
      setSwitcherOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [switcherOpen])

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

  // Sidebar is mounted once and never remounts on screen navigation
  // (unlike Home, which would otherwise refetch for free) — so
  // languages added/removed elsewhere (AddLanguages, ManageLanguages)
  // go stale here until the menu is reopened.
  function handleToggleSwitcher() {
    if (!switcherOpen) getLanguages().then(setLanguages)
    setSwitcherOpen((value) => !value)
  }

  const navItems = [
    { key: 'home', label: 'Home', icon: <HomeIcon /> },
    { key: 'stats', label: 'Estatísticas', icon: <BarChart /> },
    { key: 'library', label: 'Biblioteca', icon: <Book /> },
  ]

  return (
    <nav className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-language" ref={languageMenuRef}>
          <Dropdown
            label={activeLanguage?.name}
            flag={activeLanguage && <Flag code={activeLanguage.flagCode} />}
            outline
            selected={switcherOpen}
            onClick={handleToggleSwitcher}
          />
          {switcherOpen && (
            <div className="sidebar-language-menu">
              {languages.map((language, index) => (
                <SelectableListItem
                  key={language.id}
                  label={language.name}
                  position={index === 0 ? 'first' : 'middle'}
                  flag={<Flag code={language.flagCode} />}
                  selected={language.id === activeId}
                  trailingIcon={language.id === activeId ? <Check /> : null}
                  divider={index > 0}
                  onClick={() => handlePick(language)}
                />
              ))}
              <div className="sidebar-language-menu-divider" />
              <div className="sidebar-language-menu-actions">
                <SelectableListItem
                  label="Adicionar idiomas"
                  leadingIcon={<Add />}
                  data-variant="accent"
                  position="middle"
                  onClick={handleAddLanguages}
                />
                <SelectableListItem
                  label="Gerenciar idiomas"
                  leadingIcon={<Settings />}
                  position="last"
                  onClick={handleManageLanguages}
                />
              </div>
            </div>
          )}
        </div>
        <div className="sidebar-divider" />
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
      <button
        type="button"
        className="sidebar-item"
        data-active={activeScreen === 'settings'}
        onClick={onOpenSettings}
      >
        <span className="sidebar-item-icon"><Settings /></span>
        <span className="sidebar-item-label">Configurações</span>
      </button>
    </nav>
  )
}

export default Sidebar
