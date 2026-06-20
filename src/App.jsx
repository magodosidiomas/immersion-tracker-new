import { useEffect, useState } from 'react'
import ComponentShowcase from './dev/ComponentShowcase'
import SelectLanguage from './screens/SelectLanguage'
import Home from './screens/Home'
import Settings from './screens/Settings'
import Backup from './screens/Backup'
import ManageLanguages from './screens/ManageLanguages'
import AddLanguages from './screens/AddLanguages'
import NewSession from './screens/NewSession'
import EditSession from './screens/EditSession'
import { getAppSettings } from './db'
import { useTimerDraft } from './hooks/useTimerDraft'

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

  // Which session EditSession is open for — set right before switching
  // to that screen, from the row tapped in Home's history list.
  const [editingSession, setEditingSession] = useState(null)

  // Lifted here (not inside NewSession) so Home's TimerWidget can show
  // and tick the same live timer without that screen being open — see
  // useTimerDraft for the IndexedDB recovery rules.
  const timer = useTimerDraft()

  // Every forward navigation pushes a history entry carrying the target
  // screen. Going "back" — whether via the device/browser back button or
  // an in-app back/close button calling window.history.back() — fires
  // 'popstate', and the listener below just mirrors history.state into
  // `screen`. This keeps both back mechanisms identical by construction:
  // there's no separate hardcoded "go to settings" style back target
  // anymore, the back button always retraces the actual path taken to
  // reach the current screen (e.g. opening Manage Languages from Home's
  // shortcut now goes back to Home, not Settings, since Settings was
  // never visited in that path).
  const navigate = (nextScreen, session = null) => {
    setEditingSession(session)
    setScreen(nextScreen)
    window.history.pushState({ screen: nextScreen }, '')
  }

  useEffect(() => {
    if (isDesignSystem || isOnboardingPreview) return
    // Base entry for the session: Home, with no forward entries ahead of
    // it. Pressing back from here exits the page, same as any app's root.
    window.history.replaceState({ screen: 'home' }, '')
    const onPopState = (event) => {
      setScreen(event.state?.screen ?? 'home')
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
        // on 'manage-languages' from before the delete. This is a direct
        // reset, not a back navigation, so it doesn't touch history —
        // any stale forward entries left behind are harmless, since
        // hasLanguage === false renders the onboarding screen regardless
        // of what `screen` says.
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
      />
    )
  }
  if (screen === 'new-session') {
    return <NewSession timer={timer} onClose={() => window.history.back()} />
  }
  if (screen === 'edit-session') {
    return <EditSession session={editingSession} onBack={() => window.history.back()} onSaved={() => window.history.back()} />
  }
  return (
    <Home
      timer={timer}
      onOpenSettings={() => navigate('settings')}
      onOpenManageLanguages={() => navigate('manage-languages')}
      onOpenNewSession={() => navigate('new-session')}
      onOpenEditSession={(session) => navigate('edit-session', session)}
    />
  )
}

export default App
