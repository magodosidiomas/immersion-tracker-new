import { useEffect, useState } from 'react'
import { getContentsByLanguage, deleteContent, createContent } from '../db'
import { formatDateInput, formatGroupLabel } from '../utils/date'
import { useLongPress } from '../hooks/useLongPress'
import LanguageTopNav from '../components/LanguageTopNav'
import TopNav from '../components/TopNav'
import TopNavDesktop from '../components/TopNavDesktop'
import BottomNav from '../components/BottomNav'
import Button from '../components/Button'
import ContentSearchList from '../components/ContentSearchList'
import ConfirmDialog from '../components/ConfirmDialog'
import { useContentFilter } from '../hooks/useContentFilter'
import {
  Add,
  Home as HomeIcon,
  BarChart,
  Book,
  Close,
  ContentCopy,
  Delete,
} from '@nine-thirty-five/material-symbols-react/outlined'
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
//
// Long-press selection: same contextual TopNav pattern as DayHistory
// (close left; duplicate — only meaningful for exactly one selected
// row — and delete right, delete always confirmed). Duplicate copies
// a content row itself; the session-count/latestSessionDate that
// content carries starts fresh (0 sessões) since a duplicated content
// is a new, unlinked entry, not a clone of the original's history.
function Library({
  onOpenNewContent,
  onOpenContent,
  onOpenSettings,
  onOpenManageLanguages,
  onOpenHome,
  onOpenStatistics,
  // Mirrors Home's onHasSessionsChange. Not wired from App yet — there's
  // no desktop sidebar action for Library to hide. Ready for when one
  // exists (same pattern as hideNewSessionButton on Sidebar).
  onHasContentChange,
}) {
  const [activeId, setActiveId] = useState(null)
  const [contents, setContents] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const selectionMode = selectedIds.length > 0
  const bindLongPress = useLongPress()

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
  }, [activeId, refreshTick])

  function refreshContents() {
    setRefreshTick((tick) => tick + 1)
  }

  function toggleSelected(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id],
    )
  }

  function exitSelectionMode() {
    setSelectedIds([])
  }

  function handleItemClick(item, isLongPress) {
    if (isLongPress) {
      setSelectedIds([item.id])
    } else if (selectionMode) {
      toggleSelected(item.id)
    } else {
      onOpenContent(item)
    }
  }

  async function handleDuplicate() {
    const [id] = selectedIds
    const original = contents.find((content) => content.id === id)
    if (!original) return
    const rest = { ...original }
    delete rest.id
    delete rest.createdAt
    delete rest.title
    delete rest.sessionCount
    delete rest.latestSessionDate
    await createContent(rest)
    exitSelectionMode()
    refreshContents()
  }

  async function handleDeleteConfirmed() {
    await Promise.all(selectedIds.map((id) => deleteContent(id)))
    setConfirmOpen(false)
    exitSelectionMode()
    refreshContents()
  }

  const todayStr = formatDateInput(new Date())
  const items = contents.map((content) => ({
    ...content,
    subtitle: formatSessionCount(content.sessionCount),
    dateLabel: content.latestSessionDate ? formatGroupLabel(content.latestSessionDate, todayStr) : 'Sem sessões',
  }))

  const { query, setQuery, selectedTypes, toggleType, setSelectedTypes, groups } = useContentFilter(items)
  const isEmpty = groups.length === 0

  useEffect(() => {
    onHasContentChange?.(!isEmpty)
  }, [isEmpty, onHasContentChange])

  return (
    <main className="library">
      {selectionMode ? (
        <TopNav
          title={`${selectedIds.length} selecionado${selectedIds.length === 1 ? '' : 's'}`}
          leadingIcon={
            <button type="button" className="top-nav-icon-reset" onClick={exitSelectionMode} aria-label="Fechar seleção">
              <Close />
            </button>
          }
          trailingLeft={
            selectedIds.length === 1 && (
              <button type="button" className="top-nav-icon-reset" onClick={handleDuplicate} aria-label="Duplicar">
                <ContentCopy />
              </button>
            )
          }
          trailingRight={
            <button type="button" className="top-nav-icon-reset" onClick={() => setConfirmOpen(true)} aria-label="Excluir">
              <Delete />
            </button>
          }
          hasDivider
        />
      ) : (
        <LanguageTopNav
          onOpenSettings={onOpenSettings}
          onOpenManageLanguages={onOpenManageLanguages}
          onActiveLanguageChange={setActiveId}
        />
      )}
      <TopNavDesktop
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar conteúdo"
        actionLabel="Adicionar conteúdo"
        actionIcon={<Add />}
        onActionClick={onOpenNewContent}
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
          onItemClick={handleItemClick}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          bindLongPress={bindLongPress}
          showAddButton={false}
          emptyStateButtonVariant="primary"
          emptyStateStyle="responsive"
          showEmptyStateButton={false}
          hasContent={items.length > 0}
        />
      </div>
      <div className="library-bottom-layer">
        <div className="library-fab-row">
          <Button leadingIcon={<Add />} onClick={onOpenNewContent}>
            Adicionar conteúdo
          </Button>
        </div>
        <BottomNav
          items={[
            { label: 'Início', icon: <HomeIcon />, onClick: onOpenHome },
            { label: 'Estatísticas', icon: <BarChart />, onClick: onOpenStatistics },
            { label: 'Biblioteca', icon: <Book />, active: true },
          ]}
        />
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={selectedIds.length === 1 ? 'Excluir conteúdo?' : `Excluir ${selectedIds.length} conteúdos?`}
        description="Essa ação não pode ser desfeita."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirmed}
      />
    </main>
  )
}

export default Library
