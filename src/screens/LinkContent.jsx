import TopNav from '../components/TopNav'
import Button from '../components/Button'
import ContentSearchList from '../components/ContentSearchList'
import { useContentFilter } from '../hooks/useContentFilter'
import { ArrowBack, Add } from '@nine-thirty-five/material-symbols-react/outlined'
import './LinkContent.css'

// Opened from SessionForm's "Vincular conteúdo" button. Same search/
// filter/grouped-list body as Library (ContentSearchList), but the
// chrome is different: a plain back nav instead of the language
// switcher, and a single "+ Adicionar conteúdo" footer button instead
// of the 3-tab BottomNav — tapping a row selects it for the session
// rather than opening its own edit screen.
function LinkContent({ items = [], onSelect, onAddContent, onBack }) {
  const { query, setQuery, selectedTypes, toggleType, setSelectedTypes, groups } = useContentFilter(items)

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
    </main>
  )
}

export default LinkContent
