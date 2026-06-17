import { useEffect, useState } from 'react'
import ComponentShowcase from './dev/ComponentShowcase'
import SelectLanguage from './screens/SelectLanguage'
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

  useEffect(() => {
    if (isDesignSystem) return
    getAppSettings().then((settings) => {
      setHasLanguage(Boolean(settings.activeLanguageId))
    })
  }, [isDesignSystem])

  if (isDesignSystem) return <ComponentShowcase />
  if (hasLanguage === null) return null
  if (!hasLanguage) return <SelectLanguage onSelect={() => setHasLanguage(true)} />
  return <Home />
}

// Placeholder until real screens get built from Figma. Intentionally
// minimal — this isn't a designed screen, just a stand-in so the root
// isn't a blank page.
function Home() {
  return (
    <main
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-purple-900)',
        color: 'var(--color-text-tertiary)',
        fontFamily: 'var(--font-family-main)',
      }}
    >
      Imerso — em construção
    </main>
  )
}

export default App
