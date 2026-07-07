import LanguageTopNav from '../components/LanguageTopNav'
import BottomNav from '../components/BottomNav'
import ContentSearchList from '../components/ContentSearchList'
import { useContentFilter } from '../hooks/useContentFilter'
import { Home as HomeIcon, BarChart, Book } from '@nine-thirty-five/material-symbols-react/outlined'
import './Library.css'

// The main Biblioteca tab. The search/filter/grouped-list body is
// shared with LinkContent (see ContentSearchList) — only the chrome
// differs: LanguageTopNav + 3-tab BottomNav here, vs a plain back nav
// + single footer button there. `items` must already carry a
// precomputed `dateLabel` (Hoje/Ontem/13/04 — utils/date.js's concern,
// not this component's) and `type` matching a CONTENT_TYPES key.
function Library({
  items = [],
  onOpenNewContent,
  onOpenContent,
  onOpenSettings,
  onOpenManageLanguages,
  onOpenHome,
  onOpenStatistics,
}) {
  const { query, setQuery, selectedTypes, toggleType, setSelectedTypes, groups } = useContentFilter(items)

  return (
    <main className="library">
      <LanguageTopNav onOpenSettings={onOpenSettings} onOpenManageLanguages={onOpenManageLanguages} />
      <div className="library-content">
        <ContentSearchList
          query={query}
          onQueryChange={setQuery}
          selectedTypes={selectedTypes}
          onToggleType={toggleType}
          onClearTypes={() => setSelectedTypes([])}
          groups={groups}
          onAddContent={onOpenNewContent}
          onItemClick={onOpenContent}
        />
      </div>
      <div className="library-bottom-layer">
        <BottomNav
          items={[
            { label: 'Início', icon: <HomeIcon />, onClick: onOpenHome },
            { label: 'Estatísticas', icon: <BarChart />, onClick: onOpenStatistics },
            { label: 'Biblioteca', icon: <Book />, active: true },
          ]}
        />
      </div>
    </main>
  )
}

export default Library
