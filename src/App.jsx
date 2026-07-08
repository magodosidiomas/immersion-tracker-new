import { useEffect, useRef, useState } from 'react'
import ComponentShowcase from './dev/ComponentShowcase'
import SelectLanguage from './screens/SelectLanguage'
import Home from './screens/Home'
import Settings from './screens/Settings'
import Backup from './screens/Backup'
import ManageLanguages from './screens/ManageLanguages'
import AddLanguages from './screens/AddLanguages'
import NewSession from './screens/NewSession'
import EditSession from './screens/EditSession'
import Statistics from './screens/Statistics'
import DayHistory from './screens/DayHistory'
import Library from './screens/Library'
import EditContent from './screens/EditContent'
import ManageSeries from './screens/ManageSeries'
import ManageEpisodes from './screens/ManageEpisodes'
import EpisodeDetail from './screens/EpisodeDetail'
import LinkContent from './screens/LinkContent'
import LinkSession from './screens/LinkSession'
import { getAppSettings, getFilmeContent } from './db'
import { useTimerDraft } from './hooks/useTimerDraft'
import { useViewportHeight } from './hooks/useViewportHeight'

// Design system viewer lives at the #design-system hash instead of a
// real route. No router needed for one hidden page, and a hash never
// hits the server — so it works on any static host with zero routing
// config, unlike a path like /design-system (which would 404 on
// direct load unless the host has SPA fallback configured).
//
// Visit it at: <site-url>/#design-system
// Same idea as #design-system: lets the real onboarding screen be
// viewed/tested any time, without touching the actual hasLanguage
// check or IndexedDB. SelectLanguage's `preview` prop skips its
// addLanguage() write, so tapping a row is safe to try repeatedly.
//
// Visit it at: <site-url>/#onboarding
function App() {
  useViewportHeight()

  const isDesignSystem = window.location.hash === '#design-system'
  const isOnboardingPreview = window.location.hash === '#onboarding'

  // Whether to show onboarding or Home isn't a route, it's a question
  // about data: is there an active language yet? null means "still
  // checking IndexedDB" so we don't flash the wrong screen on load.
  const [hasLanguage, setHasLanguage] = useState(null)

  // Home vs Settings vs ManageLanguages vs AddLanguages is plain state,
  // not a route — still simpler than a router for this size of nav (no
  // deep-linking need yet). Browser/device history is layered on top of
  // this state below, so the OS back button steps through screens
  // instead of closing the page.
  const [screen, setScreen] = useState('home')

  // LinkContent/LinkSession render as an overlay ON TOP of whatever
  // `screen` currently is, instead of replacing it — critical for
  // NewSession's "finish" phase and EditSession, both of which hold
  // meaningful state (phase, pending content, the session being
  // edited) that a normal screen swap would unmount and lose. null
  // means no overlay is open.
  const [pickerScreen, setPickerScreen] = useState(null)

  // Which session EditSession is open for — set right before switching
  // to that screen, from the row tapped in Home's history list.
  const [editingSession, setEditingSession] = useState(null)

  // Which day DayHistory is showing — set right before switching to
  // that screen, from the cell tapped in Statistics' Calendar. Kept
  // separate from editingSession (a date string, not a Session row).
  const [historyDate, setHistoryDate] = useState(null)

  // Which content EditContent is open for — null means "new content",
  // same isNew-by-presence convention as editingSession.
  const [editingContentId, setEditingContentId] = useState(null)

  // Which série/filme ManageEpisodes/EpisodeDetail are drilled into —
  // { id, label } from whichever row was tapped in ManageSeries.
  const [activeCatalog, setActiveCatalog] = useState(null)

  // Which episode EpisodeDetail is showing sessões for. null season
  // means the filme case — EpisodeDetail reads that as "no episódios
  // layer", per its own doc comment.
  const [activeEpisode, setActiveEpisode] = useState(null)

  // LinkContent/LinkSession are generic pickers reused from several
  // places (NewSession/EditSession's "Vincular conteúdo",
  // ContentForm/EpisodeDetail's "Vincular sessão") — rather than a
  // separate navigation state per caller, whoever opens the picker
  // hands over a callback to run with whatever gets picked, stashed
  // here since it doesn't need to trigger a render.
  const pendingPickCallback = useRef(null)

  // A manual "Nova sessão" opened from inside LinkSession (see
  // openManualSession below) renders as a THIRD overlay layer, stacked
  // on top of the link-session picker overlay, rather than going
  // through `navigate()` — navigate() swaps `screen`, which would
  // unmount whatever's underneath (EditContent/EpisodeDetail) and lose
  // its in-progress draft (link/título/thumbnail etc.). Staying an
  // overlay keeps all of that mounted and untouched.
  const [manualSessionOverlay, setManualSessionOverlay] = useState(false)

  // Bumped whenever a manual session is saved/discarded so LinkSession
  // (which stays mounted underneath and wouldn't otherwise refetch)
  // picks up the newly created session in its day list.
  const [sessionRefreshTick, setSessionRefreshTick] = useState(0)

  function openLinkContent(callback) {
    pendingPickCallback.current = callback
    setPickerScreen('link-content')
    window.history.pushState({ screen, pickerScreen: 'link-content' }, '')
  }

  function openLinkSession(callback) {
    pendingPickCallback.current = callback
    setPickerScreen('link-session')
    window.history.pushState({ screen, pickerScreen: 'link-session' }, '')
  }

  function closePicker() {
    window.history.back()
  }

  // Opens the manual-entry NewSession overlay on top of whatever's
  // currently showing (screen + any picker overlay already open),
  // without touching either — see manualSessionOverlay above.
  function openManualSession() {
    setManualSessionOverlay(true)
    window.history.pushState({ screen, pickerScreen, manualSessionOverlay: true }, '')
  }

  function closeManualSession() {
    setSessionRefreshTick((tick) => tick + 1)
    window.history.back()
  }

  // Lifted here (not inside NewSession) so Home's TimerWidget can show
  // and tick the same live timer without that screen being open — see
  // useTimerDraft for the IndexedDB recovery rules.
  const timer = useTimerDraft()

  // Every forward navigation pushes a history entry carrying the target
  // screen. Going "back" — whether via the device/browser back button or
  // an in-app back/close button calling window.history.back() — fires
  // 'popstate', and the listener below just mirrors history.state into
  // `screen`/`pickerScreen`. This keeps both back mechanisms identical
  // by construction: there's no separate hardcoded "go to settings"
  // style back target anymore, the back button always retraces the
  // actual path taken to reach the current screen (e.g. opening Manage
  // Languages from Home's shortcut now goes back to Home, not Settings,
  // since Settings was never visited in that path). A real `navigate`
  // always closes any open picker overlay too, since it means the
  // person moved on to a genuinely different screen.
  const navigate = (nextScreen, session = null) => {
    setEditingSession(session)
    setScreen(nextScreen)
    setPickerScreen(null)
    setManualSessionOverlay(false)
    window.history.pushState({ screen: nextScreen }, '')
  }

  useEffect(() => {
    if (isDesignSystem || isOnboardingPreview) return
    // Base entry for the session: Home, with no forward entries ahead of
    // it. Pressing back from here exits the page, same as any app's root.
    window.history.replaceState({ screen: 'home' }, '')
    const onPopState = (event) => {
      setScreen(event.state?.screen ?? 'home')
      setPickerScreen(event.state?.pickerScreen ?? null)
      setManualSessionOverlay(Boolean(event.state?.manualSessionOverlay))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [isDesignSystem, isOnboardingPreview])

  useEffect(() => {
    if (isDesignSystem || isOnboardingPreview) return
    getAppSettings().then((settings) => {
      setHasLanguage(Boolean(settings.activeLanguageId))
    })
  }, [isDesignSystem, isOnboardingPreview])

  if (isDesignSystem) return <ComponentShowcase />
  if (isOnboardingPreview) return <SelectLanguage preview onSelect={() => {}} />
  // Also waits on timer.loaded — otherwise Home could flash the "Iniciar
  // timer" FAB for a frame before a recovered draft swaps in TimerWidget.
  if (hasLanguage === null || !timer.loaded) return null
  if (!hasLanguage) return <SelectLanguage onSelect={() => setHasLanguage(true)} />

  function renderScreen() {
    // AddLanguages sits one level below ManageLanguages — both closing
    // (X) and finishing (Adicionar) return there, since either way the
    // list it shows may need refetching.
    if (screen === 'add-languages') {
      return <AddLanguages onClose={() => window.history.back()} />
    }
    if (screen === 'manage-languages') {
      return (
        <ManageLanguages
          onBack={() => window.history.back()}
          onOpenAddLanguages={() => navigate('add-languages')}
          // Removing the last language drops activeLanguageId to null.
          // Resetting `screen` here too (not just hasLanguage) matters:
          // without it, picking a language in onboarding would render
          // this same screen again, since `screen` would still be stuck
          // on 'manage-languages' from before the delete. This is a
          // direct reset, not a back navigation, so it doesn't touch
          // history — any stale forward entries left behind are
          // harmless, since hasLanguage === false renders the
          // onboarding screen regardless of what `screen` says.
          onAllLanguagesRemoved={() => {
            setHasLanguage(false)
            setScreen('home')
          }}
        />
      )
    }
    if (screen === 'backup') {
      return <Backup onBack={() => window.history.back()} />
    }
    if (screen === 'settings') {
      return (
        <Settings
          onBack={() => window.history.back()}
          onOpenManageLanguages={() => navigate('manage-languages')}
          onOpenBackup={() => navigate('backup')}
          onOpenManageSeries={() => navigate('manage-series')}
          onOpenManageMovies={() => navigate('manage-movies')}
        />
      )
    }
    if (screen === 'new-session') {
      return <NewSession timer={timer} onClose={() => window.history.back()} onOpenLinkContent={openLinkContent} onSaved={() => window.history.back()} />
    }
    if (screen === 'edit-session') {
      return (
        <EditSession
          session={editingSession}
          onBack={() => window.history.back()}
          onSaved={() => window.history.back()}
          onOpenLinkContent={openLinkContent}
        />
      )
    }
    if (screen === 'stats') {
      return (
        <Statistics
          onOpenHome={() => navigate('home')}
          onOpenSettings={() => navigate('settings')}
          onOpenManageLanguages={() => navigate('manage-languages')}
          onOpenAddLanguages={() => navigate('add-languages')}
          onOpenLibrary={() => navigate('library')}
          onOpenDay={(dateStr) => {
            setHistoryDate(dateStr)
            navigate('day-history')
          }}
        />
      )
    }
    if (screen === 'day-history') {
      return (
        <DayHistory
          date={historyDate}
          onBack={() => window.history.back()}
          onOpenEditSession={(session) => navigate('edit-session', session)}
        />
      )
    }
    if (screen === 'library') {
      return (
        <Library
          onOpenHome={() => navigate('home')}
          onOpenStatistics={() => navigate('stats')}
          onOpenSettings={() => navigate('settings')}
          onOpenManageLanguages={() => navigate('manage-languages')}
          onOpenAddLanguages={() => navigate('add-languages')}
          onOpenNewContent={() => {
            setEditingContentId(null)
            navigate('edit-content')
          }}
          onOpenContent={(item) => {
            setEditingContentId(item.id)
            navigate('edit-content')
          }}
        />
      )
    }
    if (screen === 'edit-content') {
      return (
        <EditContent
          contentId={editingContentId}
          onBack={() => window.history.back()}
          onSaved={() => window.history.back()}
          onOpenLinkSession={openLinkSession}
          onOpenSession={(session) => navigate('edit-session', session)}
          onOpenManage={(kind) => navigate(kind === 'serie' ? 'manage-series' : 'manage-movies')}
        />
      )
    }
    if (screen === 'manage-series' || screen === 'manage-movies') {
      const kind = screen === 'manage-series' ? 'serie' : 'filme'
      return (
        <ManageSeries
          kind={kind}
          onBack={() => window.history.back()}
          onOpenEpisodes={(item) => {
            setActiveCatalog(item)
            navigate('manage-episodes')
          }}
          onOpenSessions={async (item) => {
            setActiveCatalog(item)
            const content = await getFilmeContent(item.id)
            setActiveEpisode({ contentId: content?.id ?? null, season: null, episode: null })
            navigate('episode-detail')
          }}
        />
      )
    }
    if (screen === 'manage-episodes') {
      return (
        <ManageEpisodes
          catalogId={activeCatalog?.id}
          seriesName={activeCatalog?.label}
          onBack={() => window.history.back()}
          onOpenEpisode={(ep) => {
            setActiveEpisode({ contentId: ep.contentId, season: ep.season, episode: ep.episode })
            navigate('episode-detail')
          }}
        />
      )
    }
    if (screen === 'episode-detail') {
      return (
        <EpisodeDetail
          contentId={activeEpisode?.contentId}
          seriesName={activeCatalog?.label}
          episode={activeEpisode?.season != null ? { season: activeEpisode.season, episode: activeEpisode.episode } : null}
          onAddSession={openLinkSession}
          onOpenSession={(session) => navigate('edit-session', session)}
          onBack={() => window.history.back()}
        />
      )
    }
    return (
      <Home
        timer={timer}
        onOpenSettings={() => navigate('settings')}
        onOpenManageLanguages={() => navigate('manage-languages')}
        onOpenAddLanguages={() => navigate('add-languages')}
        onOpenNewSession={() => navigate('new-session')}
        onOpenEditSession={(session) => navigate('edit-session', session)}
        onOpenStatistics={() => navigate('stats')}
        onOpenLibrary={() => navigate('library')}
      />
    )
  }

  return (
    <>
      {renderScreen()}
      {pickerScreen === 'link-content' && (
        <div className="picker-overlay">
          <LinkContent
            onBack={closePicker}
            onAddContent={() => {
              setEditingContentId(null)
              navigate('edit-content')
            }}
            onSelect={(item) => {
              pendingPickCallback.current?.(item)
              closePicker()
            }}
          />
        </div>
      )}
      {pickerScreen === 'link-session' && (
        <div className="picker-overlay">
          <LinkSession
            onBack={closePicker}
            onSelect={(session) => {
              pendingPickCallback.current?.(session)
              closePicker()
            }}
            onAddSession={openManualSession}
            refreshTick={sessionRefreshTick}
          />
        </div>
      )}
      {manualSessionOverlay && (
        <div className="picker-overlay">
          <NewSession timer={timer} manualOnly onClose={closeManualSession} onSaved={closeManualSession} />
        </div>
      )}
    </>
  )
}

export default App
