import { useEffect, useState } from 'react'
import ComponentShowcase from './dev/ComponentShowcase'
import SelectLanguage from './screens/SelectLanguage'
import Home from './screens/Home'
import Settings from './screens/Settings'
import ManageLanguages from './screens/ManageLanguages'
import AddLanguages from './screens/AddLanguages'
import NewSession from './screens/NewSession'
import EditSession from './screens/EditSession'
import { getAppSettings } from './db'

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
  // deep-linking need yet).
  const [screen, setScreen] = useState('home')

  // Which session EditSession is open for — set right before switching
  // to that screen, from the row tapped in Home's history list.
  const [editingSession, setEditingSession] = useState(null)

  useEffect(() => {
    if (isDesignSystem || isOnboardingPreview) return
    getAppSettings().then((settings) => {
      setHasLanguage(Boolean(settings.activeLanguageId))
    })
  }, [isDesignSystem, isOnboardingPreview])

  if (isDesignSystem) return <ComponentShowcase />
  if (isOnboardingPreview) return <SelectLanguage preview onSelect={() => {}} />
  if (hasLanguage === null) return null
  if (!hasLanguage) return <SelectLanguage onSelect={() => setHasLanguage(true)} />
  // AddLanguages sits one level below ManageLanguages — both closing
  // (X) and finishing (Adicionar) return there, since either way the
  // list it shows may need refetching.
  if (screen === 'add-languages') {
    return <AddLanguages onClose={() => setScreen('manage-languages')} />
  }
  // ManageLanguages sits inside Settings in the nav hierarchy, so its
  // back button always returns to 'settings' — even when this screen
  // was reached via Home's dropdown shortcut below.
  if (screen === 'manage-languages') {
    return (
      <ManageLanguages
        onBack={() => setScreen('settings')}
        onOpenAddLanguages={() => setScreen('add-languages')}
        // Removing the last language drops activeLanguageId to null.
        // Resetting `screen` here too (not just hasLanguage) matters:
        // without it, picking a language in onboarding would render
        // this same screen again, since `screen` would still be stuck
        // on 'manage-languages' from before the delete.
        onAllLanguagesRemoved={() => {
          setHasLanguage(false)
          setScreen('home')
        }}
      />
    )
  }
  if (screen === 'settings') {
    return (
      <Settings onBack={() => setScreen('home')} onOpenManageLanguages={() => setScreen('manage-languages')} />
    )
  }
  if (screen === 'new-session') {
    return <NewSession onClose={() => setScreen('home')} />
  }
  if (screen === 'edit-session') {
    return <EditSession session={editingSession} onBack={() => setScreen('home')} onSaved={() => setScreen('home')} />
  }
  return (
    <Home
      onOpenSettings={() => setScreen('settings')}
      onOpenManageLanguages={() => setScreen('manage-languages')}
      onOpenNewSession={() => setScreen('new-session')}
      onOpenEditSession={(session) => {
        setEditingSession(session)
        setScreen('edit-session')
      }}
    />
  )
}

export default App
