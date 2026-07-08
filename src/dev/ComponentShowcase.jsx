import { useState, useEffect, useMemo } from 'react'
import './design-system/DesignSystem.css'
import registry from './design-system/registry'
import CodeBlock from './design-system/CodeBlock'
import TopNav from '../components/TopNav'
import InputField from '../components/InputField'
import SelectableListItem from '../components/SelectableListItem'
import { ArrowBack, Search } from '@nine-thirty-five/material-symbols-react/outlined'

// One page per component instead of one long scroll — the old version
// of this file. Routing piggybacks on the #design-system hash App.jsx
// already checks (#design-system/button, etc.) rather than pulling in
// a router for one dev-only screen.
function useHashComponentId() {
  const [id, setId] = useState(() => window.location.hash.split('/')[1] || null)
  useEffect(() => {
    const onHashChange = () => setId(window.location.hash.split('/')[1] || null)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return id
}

// #root is capped at 480px (see index.css) for the phone-like column
// every real screen assumes. This is the one screen meant to use the
// full desktop viewport instead, so it opts out for as long as it's
// mounted rather than changing that global rule.
function useFullWidthRoot() {
  useEffect(() => {
    document.body.classList.add('ds-active')
    return () => document.body.classList.remove('ds-active')
  }, [])
}

function ComponentList({ query, onQueryChange, activeId, onSelect }) {
  // Letter-group headers are computed once per filtered list (not
  // mutated during the render/map below) so this stays a pure render.
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? registry.filter((c) => c.name.toLowerCase().includes(q)) : registry
    return list.reduce((acc, component) => {
      const letter = component.name[0].toUpperCase()
      const prevLetter = acc.length ? acc[acc.length - 1].letter : null
      acc.push({ component, letter, showLetter: letter !== prevLetter })
      return acc
    }, [])
  }, [query])

  return (
    <>
      <div className="ds-search">
        <InputField placeholder="Buscar componente" leadingIcon={<Search />} value={query} onChange={(e) => onQueryChange(e.target.value)} />
      </div>
      <div className="ds-list-items">
        {grouped.map(({ component, showLetter, letter }) => (
          <div key={component.id}>
            {showLetter && <div className="ds-list-letter">{letter}</div>}
            <SelectableListItem label={component.name} selected={component.id === activeId} onClick={() => onSelect(component.id)} />
          </div>
        ))}
      </div>
    </>
  )
}

function ComponentBody({ component }) {
  return (
    <div className="ds-page-content">
      <h1 className="ds-page-title">{component.name}</h1>
      {component.description && <p className="ds-page-description">{component.description}</p>}
      <div className="ds-page-preview">{component.render()}</div>
      <CodeBlock code={component.code} />
    </div>
  )
}

function ComponentShowcase() {
  useFullWidthRoot()
  const hashId = useHashComponentId()
  const [query, setQuery] = useState('')
  const active = registry.find((c) => c.id === hashId) || null
  const desktopActive = active || registry[0]

  const selectComponent = (id) => {
    window.location.hash = `#design-system/${id}`
  }
  const goToList = () => {
    window.location.hash = '#design-system'
  }

  return (
    <div className="ds-shell">
      {/* Desktop: sidebar + main pane, always both visible. Defaults to
          the first component alphabetically when nothing is selected
          yet, without touching the hash. */}
      <div className="ds-sidebar">
        <div className="ds-sidebar-header">Design System</div>
        <ComponentList query={query} onQueryChange={setQuery} activeId={desktopActive.id} onSelect={selectComponent} />
      </div>
      <div className="ds-main">
        <div className="ds-main-topbar">Design System / {desktopActive.name}</div>
        <div className="ds-main-scroll">
          <ComponentBody component={desktopActive} />
        </div>
      </div>

      {/* Mobile: list and page are mutually exclusive full-screen views. */}
      <div className="ds-mobile">
        {active ? (
          <>
            <TopNav
              leadingIcon={
                <button type="button" className="top-nav-icon-reset" onClick={goToList} aria-label="Voltar">
                  <ArrowBack />
                </button>
              }
              title={active.name}
              hasDivider
            />
            <div className="ds-main-scroll">
              <ComponentBody component={active} />
            </div>
          </>
        ) : (
          <>
            <TopNav title="Design System" hasDivider />
            <ComponentList query={query} onQueryChange={setQuery} activeId={null} onSelect={selectComponent} />
          </>
        )}
      </div>
    </div>
  )
}

export default ComponentShowcase
