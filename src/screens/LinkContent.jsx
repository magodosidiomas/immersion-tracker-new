import { useEffect, useState } from 'react'
import { getAppSettings, getContentsByLanguage } from '../db'
import { formatDateInput, formatGroupLabel } from '../utils/date'
import TopNav from '../components/TopNav'
import Button from '../components/Button'
import ContentSearchList from '../components/ContentSearchList'
import { useContentFilter } from '../hooks/useContentFilter'
import { ArrowBack, Add } from '@nine-thirty-five/material-symbols-react/outlined'
import './LinkContent.css'

function formatSessionCount(count) {
  return `${count} ${count === 1 ? 'sessão' : 'sessões'}`
}

// Opened from SessionForm's "Vincular conteúdo" button. Same search/
// filter/grouped-list body as Library (ContentSearchList), self-
// fetching its own content the same way — but the chrome is
// different: a plain back nav instead of the language switcher, and a
// single "+ Adicionar conteúdo" footer button instead of the 3-tab
// BottomNav — tapping a row selects it for the session rather than
// opening its own edit screen.
function LinkContent({ onSelect, onAddContent, onBack, headless = false }) {
  const [languageId, setLanguageId] = useState(null)
  const [contents, setContents] = useState([])

  useEffect(() => {
    getAppSettings().then((settings) => setLanguageId(settings.activeLanguageId))
  }, [])

  useEffect(() => {
    if (!languageId) return
    getContentsByLanguage(languageId).then(setContents)
  }, [languageId])

  const todayStr = formatDateInput(new Date())
  const items = contents.map((content) => ({
    ...content,
    subtitle: formatSessionCount(content.sessionCount),
    dateLabel: content.latestSessionDate ? formatGroupLabel(content.latestSessionDate, todayStr) : 'Sem sessões',
  }))

  const { query, setQuery, selectedTypes, toggleType, setSelectedTypes, groups } = useContentFilter(items)

  const body = (
    <>
      <div className="link-content-body">
        <ContentSearchList
          query={query}
          onQueryChange={setQuery}
          selectedTypes={selectedTypes}
          onToggleType={toggleType}
          onClearTypes={() => setSelectedTypes([])}
          groups={groups}
          onAddContent={onAddContent}
          onItemClick={onSelect}
        />
      </div>
      <div className="link-content-footer">
        <Button variant="outline" fullWidth leadingIcon={<Add />} onClick={onAddContent}>
          Adicionar conteúdo
        </Button>
      </div>
    </>
  )

  // headless: rendered inside a Modal (desktop) that already supplies
  // its own header/back button — skip this screen's own TopNav/main
  // wrapper so there isn't a duplicate header.
  if (headless) return body

  return (
    <main className="link-content">
      <TopNav
        title="Vincular conteúdo"
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
      />
      {body}
    </main>
  )
}

export default LinkContent
