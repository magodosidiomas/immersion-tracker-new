import ManageLanguages from '../screens/ManageLanguages'
import Backup from '../screens/Backup'
import ManageSeries from '../screens/ManageSeries'
import { Public, Backup as BackupIcon, VideoLabel, Movie, Close } from '@nine-thirty-five/material-symbols-react/outlined'
import './SettingsWindow.css'

// Desktop-only (>=1280px) windowed shell for Configurações — mirrors
// the Figma "Modal" frame: a fixed sideNav on the left picking a
// section, and a content panel on the right that swaps in place
// instead of navigating to a new full screen. Mobile never renders
// this; App.jsx picks between this and the plain full-screen
// Settings/ManageLanguages/Backup/ManageSeries screens based on
// viewport (see useIsDesktop there).
//
// `screen` drives which section shows — same state App.jsx already
// tracks for the full-screen versions, so opening Configurações always
// lands here already scoped to the right section. 'settings' itself
// (no sub-item chosen yet) defaults to Idiomas, matching the Figma
// default state.
function SettingsWindow({ screen, onNavigate, onClose, onOpenAddLanguages, onAllLanguagesRemoved, onOpenEpisodes, onOpenFilmeSessions }) {
  const section = screen === 'settings' ? 'manage-languages' : screen

  const navItems = [
    {
      label: 'Geral',
      items: [
        { key: 'manage-languages', label: 'Idiomas', icon: <Public /> },
        { key: 'backup', label: 'Backup', icon: <BackupIcon /> },
      ],
    },
    {
      label: 'Conteúdo',
      items: [
        { key: 'manage-series', label: 'Séries', icon: <VideoLabel /> },
        { key: 'manage-movies', label: 'Filmes', icon: <Movie /> },
      ],
    },
  ]

  return (
    <div
      className="settings-window-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="settings-window">
        <nav className="settings-window-nav">
          {navItems.map((group) => (
            <div key={group.label} className="settings-window-nav-group">
              <span className="settings-window-nav-label">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="settings-window-nav-item"
                  data-active={section === item.key}
                  onClick={() => onNavigate(item.key)}
                >
                  <span className="settings-window-nav-item-icon">{item.icon}</span>
                  <span className="settings-window-nav-item-label">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="settings-window-panel">
          <div className="settings-window-panel-topbar">
            <button type="button" className="settings-window-close" onClick={onClose} aria-label="Fechar">
              <Close />
            </button>
          </div>
          <div className="settings-window-panel-content">
            {section === 'manage-languages' && (
              <>
                <h2 className="settings-window-heading">Idiomas</h2>
                <ManageLanguages
                  embedded
                  onOpenAddLanguages={onOpenAddLanguages}
                  onAllLanguagesRemoved={onAllLanguagesRemoved}
                />
              </>
            )}
            {section === 'backup' && (
              <>
                <h2 className="settings-window-heading">Backup</h2>
                <Backup embedded />
              </>
            )}
            {section === 'manage-series' && (
              <>
                <h2 className="settings-window-heading">Séries</h2>
                <ManageSeries embedded kind="serie" onOpenEpisodes={onOpenEpisodes} />
              </>
            )}
            {section === 'manage-movies' && (
              <>
                <h2 className="settings-window-heading">Filmes</h2>
                <ManageSeries embedded kind="filme" onOpenSessions={onOpenFilmeSessions} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsWindow
