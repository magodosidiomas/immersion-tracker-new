import ComponentShowcase from './dev/ComponentShowcase'

// Design system viewer lives at the #design-system hash instead of a
// real route. No router needed for one hidden page, and a hash never
// hits the server — so it works on any static host with zero routing
// config, unlike a path like /design-system (which would 404 on
// direct load unless the host has SPA fallback configured).
//
// Visit it at: <site-url>/#design-system
function App() {
  const isDesignSystem = window.location.hash === '#design-system'
  return isDesignSystem ? <ComponentShowcase /> : <Home />
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
