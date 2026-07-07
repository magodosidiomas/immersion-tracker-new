import { useEffect, useState } from 'react'
import { getContentsByLanguage } from '../db'
import { formatDateInput, formatGroupLabel } from '../utils/date'
import LanguageTopNav from '../components/LanguageTopNav'
import BottomNav from '../components/BottomNav'
import ContentSearchList from '../components/ContentSearchList'
import { useContentFilter } from '../hooks/useContentFilter'
import { Home as HomeIcon, BarChart, Book } from '@nine-thirty-five/material-symbols-react/outlined'
import './Library.css'

// "3 sessões" / "1 sessão" — every Biblioteca row's subtitle is just
// its linked-session count, singular only at exactly 1.
function formatSessionCount(count) {
  return `${count} ${count === 1 ? 'sessão' : 'sessões'}`
}

// The main Biblioteca tab. Fetches its own content for whichever
// language LanguageTopNav resolves as active (same self-fetching
// convention as Home/Statistics), then derives each row's dateLabel/
// subtitle from the raw sessionCount/latestSessionDate the db layer
// returns — that raw-data-in, format-in-the-screen split keeps
// db/index.js presentation-agnostic. The search/filter/grouped-list
// body itself is shared with LinkContent (see ContentSearchList).
function Library({
  onOpenNewContent,
  onOpenContent,
  onOpenSettings,
  onOpenManageLanguages,
  onOpenHome,
  onOpenStatistics,
}) {
  const [activeId, setActiveId] = useState(null)
  const [contents, setContents] = useState([])

  useEffect(() => {
    if (!activeId) return
    let cancelled = false
    getContentsByLanguage(activeId).then((data) => {
      if (cancelled) return
      setContents(data)
    })
    return () => {
      cancelled = true
    }
  }, [activeId])

  const todayStr = formatDateInput(new Date())
  const items = contents.map((content) => ({
    ...content,
    subtitle: formatSessionCount(content.sessionCount),
    dateLabel: content.latestSessionDate ? formatGroupLabel(content.latestSessionDate, todayStr) : 'Sem sessões',
  }))

  const { query, setQuery, selectedTypes, toggleType, setSelectedTypes, groups } = useContentFilter(items)

  return (
    <main className="library">
      <LanguageTopNav
        onOpenSettings={onOpenSettings}
        onOpenManageLanguages={onOpenManageLanguages}
        onActiveLanguageChange={setActiveId}
      />
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
