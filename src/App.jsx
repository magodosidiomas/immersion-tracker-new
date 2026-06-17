import { useEffect, useState } from 'react'
import ComponentShowcase from './dev/ComponentShowcase'
import SelectLanguage from './screens/SelectLanguage'
import Home from './screens/Home'
import Settings from './screens/Settings'
import { getAppSettings } from './db'

// Design system viewer lives at the #design-system hash instead of a
// real route. No router needed for one hidden page, and a hash never
// hits the server — so it works on any static host with zero routing
// config, unlike a path like /design-system (which would 404 on
// direct load unless the host has SPA fallback configured).
//
// Visit it at: <site-url>/#design-system
function App() {
  const isDesignSystem = window.location.hash === '#design-system'

  // Whether to show onboarding or Home isn't a route, it's a question
  // about data: is there an active language yet? null means "still
  // checking IndexedDB" so we don't flash the wrong screen on load.
  const [hasLanguage, setHasLanguage] = useState(null)

  // Home vs Settings is plain state, not a route either — just two
  // screens for now, so a router would be more machinery than this
  // needs. Revisit once there's a third screen or a reason to deep-link.
  const [screen, setScreen] = useState('home')

  useEffect(() => {
    if (isDesignSystem) return
    getAppSettings().then((settings) => {
      setHasLanguage(Boolean(settings.activeLanguageId))
    })
  }, [isDesignSystem])

  if (isDesignSystem) return <ComponentShowcase />
  if (hasLanguage === null) return null
  if (!hasLanguage) return <SelectLanguage onSelect={() => setHasLanguage(true)} />
  if (screen === 'settings') return <Settings onBack={() => setScreen('home')} />
  return <Home onOpenSettings={() => setScreen('settings')} />
}

export default App
