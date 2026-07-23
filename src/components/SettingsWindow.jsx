import { useRef, useState } from 'react'
import ManageLanguages from '../screens/ManageLanguages'
import Backup from '../screens/Backup'
import ManageSeries from '../screens/ManageSeries'
import ManageEpisodes from '../screens/ManageEpisodes'
import EpisodeDetail from '../screens/EpisodeDetail'
import Button from './Button'
import { getFilmeContent } from '../db'
import { Public, Backup as BackupIcon, VideoLabel, Movie, Close, ArrowBack, Add } from '@nine-thirty-five/material-symbols-react/outlined'
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
function SettingsWindow({ screen, onNavigate, onClose, onOpenAddLanguages, onAllLanguagesRemoved }) {
  const section = screen === 'settings' ? 'manage-languages' : screen

  // Drill-down within Séries/Filmes stays inside the modal instead of
  // navigating away (which used to unmount SettingsWindow entirely).
  // null = section's own list; otherwise a small local stack:
  //   { view: 'episodes', catalogItem } — série's episode list
  //   { view: 'episode-detail', catalogItem, contentId, episode } — sessões
  const [drill, setDrill] = useState(null)
  const seriesRef = useRef(null)
  const moviesRef = useRef(null)

  // Leaving Séries/Filmes (or switching section entirely) resets the drill —
  // adjusted during render (React's recommended pattern) rather than in an
  // effect, since this is derived from a prop change, not an external system.
  const [drillSection, setDrillSection] = useState(section)
  if (section !== drillSection) {
    setDrillSection(section)
    setDrill(null)
  }

  async function openEpisodes(item) {
    setDrill({ view: 'episodes', catalogItem: item })
  }

  async function openFilmeSessions(item) {
    const content = await getFilmeContent(item.id)
    setDrill({ view: 'episode-detail', catalogItem: item, contentId: content?.id ?? null, episode: null })
  }

  function openEpisodeDetail(ep) {
    setDrill({ view: 'episode-detail', catalogItem: drill.catalogItem, contentId: ep.contentId, episode: { season: ep.season, episode: ep.episode } })
  }

  function drillBack() {
    if (drill?.view === 'episode-detail' && drill.episode != null) {
      setDrill({ view: 'episodes', catalogItem: drill.catalogItem })
    } else {
      setDrill(null)
    }
  }

  let panelTitle = ''
  let panelAction = null
  if (section === 'manage-languages') {
    panelTitle = 'Idiomas'
  } else if (section === 'backup') {
    panelTitle = 'Backup'
  } else if (section === 'manage-series') {
    if (!drill) {
      panelTitle = 'Séries'
      panelAction = (
        <Button size="sm" leadingIcon={<Add />} onClick={() => seriesRef.current?.openCreate()}>
          Adicionar série
        </Button>
      )
    } else if (drill.view === 'episodes') {
      panelTitle = `Episódios - ${drill.catalogItem?.label ?? ''}`
    } else {
      panelTitle = drill.catalogItem?.label ?? ''
      if (drill.episode) panelTitle += ` · T${drill.episode.season} E${drill.episode.episode}`
    }
  } else if (section === 'manage-movies') {
    if (!drill) {
      panelTitle = 'Filmes'
      panelAction = (
        <Button size="sm" leadingIcon={<Add />} onClick={() => moviesRef.current?.openCreate()}>
          Adicionar filme
        </Button>
      )
    } else {
      panelTitle = drill.catalogItem?.label ?? ''
    }
  }

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
            {drill && (
              <button type="button" className="settings-window-back" onClick={drillBack} aria-label="Voltar">
                <ArrowBack />
              </button>
            )}
            <h2 className="settings-window-title">{panelTitle}</h2>
            {panelAction}
            <button type="button" className="settings-window-close" onClick={onClose} aria-label="Fechar">
              <Close />
            </button>
          </div>
          <div className="settings-window-panel-content">
            {section === 'manage-languages' && (
              <ManageLanguages
                embedded
                onOpenAddLanguages={onOpenAddLanguages}
                onAllLanguagesRemoved={onAllLanguagesRemoved}
              />
            )}
            {section === 'backup' && <Backup embedded />}
            {section === 'manage-series' && !drill && (
              <ManageSeries ref={seriesRef} embedded hideFooter kind="serie" onOpenEpisodes={openEpisodes} />
            )}
            {section === 'manage-series' && drill?.view === 'episodes' && (
              <ManageEpisodes
                embedded
                catalogId={drill.catalogItem?.id}
                seriesName={drill.catalogItem?.label}
                onOpenEpisode={openEpisodeDetail}
              />
            )}
            {section === 'manage-series' && drill?.view === 'episode-detail' && (
              <EpisodeDetail
                embedded
                contentId={drill.contentId}
                seriesName={drill.catalogItem?.label}
                episode={drill.episode}
                onAddSession={() => {}}
                onOpenSession={() => {}}
              />
            )}
            {section === 'manage-movies' && !drill && (
              <ManageSeries ref={moviesRef} embedded hideFooter kind="filme" onOpenSessions={openFilmeSessions} />
            )}
            {section === 'manage-movies' && drill?.view === 'episode-detail' && (
              <EpisodeDetail
                embedded
                contentId={drill.contentId}
                seriesName={drill.catalogItem?.label}
                episode={null}
                onAddSession={() => {}}
                onOpenSession={() => {}}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsWindow
