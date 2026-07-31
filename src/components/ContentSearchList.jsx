import MediaListItem from './MediaListItem'
import Thumbnail from './Thumbnail'
import EmptyState from './EmptyState'
import { CONTENT_TYPES } from '../data/contentTypes'
import {
  Search,
  SearchOff,
  Add,
  Book,
  Videocam,
  Mic,
  Tv,
  Movie,
  Bookmark,
  Newspaper,
  Apps,
  Edit,
  Delete,
} from '@nine-thirty-five/material-symbols-react/outlined'
import './ContentSearchList.css'

// Icon fallback per content type (see src/data/contentTypes.js) — kept
// as a lookup here rather than storing components in that data file,
// since that file is also imported by non-UI code paths.
const TYPE_ICONS = { Videocam, Mic, Tv, Movie, Bookmark, Newspaper, Apps }

// Empty-state copy per content type, shown when a type filter is active
// and no items match it (library has content, just none of that type).
const EMPTY_STATE_COPY = {
  youtube: { title: 'Nenhum vídeo do YouTube ainda', description: 'Adicione um vídeo pra começar.' },
  podcast: { title: 'Nenhum podcast ainda', description: 'Adicione um episódio pra começar.' },
  serie: { title: 'Nenhuma série ainda', description: 'Adicione uma série pra começar.' },
  filme: { title: 'Nenhum filme ainda', description: 'Adicione um filme pra começar.' },
  livro: { title: 'Nenhum livro ainda', description: 'Adicione um livro pra começar.' },
  website: { title: 'Nenhum site ainda', description: 'Adicione um site pra começar.' },
  outro: { title: 'Nada por aqui ainda', description: 'Adicione um conteúdo pra começar.' },
}


// The search+add row, type filter chips, and day-grouped content list
// shared by Library and LinkContent — same body, different chrome
// (LanguageTopNav+BottomNav vs a plain back nav + "Adicionar conteúdo"
// footer button) and a different action per row (open vs select).
function ContentSearchList({
  query,
  onQueryChange,
  selectedTypes,
  onToggleType,
  onClearTypes,
  groups,
  onAddContent,
  onItemClick,
  selectionMode = false,
  selectedIds = [],
  bindLongPress = null,
  showAddButton = true,
  emptyStateButtonVariant = 'outline',
  emptyStateStyle = 'background',
  showEmptyStateButton = true,
  hasContent = true,
  onEditItem = null,
  onDeleteItem = null,
  // LinkContent has no TopNavDesktop of its own to carry a search
  // field at the ≥1280px breakpoint (unlike Library, the only other
  // caller), so it needs this inline row kept visible there too.
  showSearchOnDesktop = false,
}) {
  const hasQuery = query.trim().length > 0
  const activeType = selectedTypes.length === 1 ? selectedTypes[0] : null

  function renderEmptyIcon() {
    if (emptyVariant === 'search') return <SearchOff />
    if (emptyVariant === 'type') {
      const typeMeta = CONTENT_TYPES.find((type) => type.key === activeType)
      const TypeIcon = typeMeta && TYPE_ICONS[typeMeta.icon]
      if (TypeIcon) return <TypeIcon />
    }
    return <Book />
  }

  let emptyTitle = 'Nenhum conteúdo ainda'
  let emptyDescription = 'Seus conteúdos vão aparecer aqui quando você adicionar.'
  let emptyShowButton = showEmptyStateButton
  let emptyVariant = 'default'

  if (hasContent && hasQuery) {
    emptyTitle = 'Nenhum resultado encontrado'
    emptyDescription = 'Tente pesquisar por outro termo.'
    emptyShowButton = false
    emptyVariant = 'search'
  } else if (hasContent && activeType && EMPTY_STATE_COPY[activeType]) {
    emptyTitle = EMPTY_STATE_COPY[activeType].title
    emptyDescription = EMPTY_STATE_COPY[activeType].description
    emptyVariant = 'type'
  }

  return (

    <>
      {hasContent && (
        <>
          <div className="content-search-list-row" data-force-visible={showSearchOnDesktop}>
            <div className="content-search-list-field">
              <Search className="content-search-list-icon" aria-hidden="true" />
              <input
                className="content-search-list-input"
                type="text"
                placeholder="Buscar conteúdo"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
            </div>
            {showAddButton && (
              <button
                type="button"
                className="content-search-list-add-button"
                onClick={onAddContent}
                aria-label="Adicionar conteúdo"
              >
                <Add />
              </button>
            )}
          </div>

          <div className="content-search-list-filters">
            <button
              type="button"
              className="content-search-list-filter-chip"
              data-selected={selectedTypes.length === 0}
              onClick={onClearTypes}
            >
              Todos
            </button>
            {CONTENT_TYPES.map((type) => (
              <button
                key={type.key}
                type="button"
                className="content-search-list-filter-chip"
                data-selected={selectedTypes.includes(type.key)}
                onClick={() => onToggleType(type.key)}
              >
                {type.label}
              </button>
            ))}
          </div>

        </>
      )}

      {groups.length === 0 ? (
        <EmptyState
          style={emptyStateStyle}
          buttonVariant={emptyStateButtonVariant}
          icon={renderEmptyIcon()}
          title={emptyTitle}
          description={emptyDescription}
          buttonLabel={emptyShowButton ? 'Adicionar conteúdo' : undefined}
          buttonIcon={<Add />}
          onButtonClick={onAddContent}
        />
      ) : (
        groups.map((group) => (
          <section key={group.label} className="content-search-list-group">
            <p className="content-search-list-label">{group.label}</p>
            <div className="content-search-list-card">
              {group.items.map((item, index) => {
                const contentType = CONTENT_TYPES.find((type) => type.key === item.type)
                const Icon = contentType && TYPE_ICONS[contentType.icon]
                const longPressProps = bindLongPress
                  ? bindLongPress(item.id, () => onItemClick(item, true), () => onItemClick(item))
                  : { onClick: () => onItemClick(item) }
                const menu =
                  !selectionMode && (onEditItem || onDeleteItem)
                    ? [
                        onEditItem && { label: 'Editar', icon: <Edit />, onClick: () => onEditItem(item) },
                        onDeleteItem && {
                          label: 'Excluir',
                          icon: <Delete />,
                          danger: true,
                          onClick: () => onDeleteItem(item),
                        },
                      ].filter(Boolean)
                    : null
                return (
                  <MediaListItem
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    divider={index < group.items.length - 1}
                    selectionMode={selectionMode}
                    selected={selectedIds.includes(item.id)}
                    menu={menu}
                    {...longPressProps}
                    thumbnail={
                      <Thumbnail
                        size={item.type === 'livro' ? 'book' : 'sm'}
                        src={item.thumbnail}
                        alt={item.title}
                        icon={Icon && <Icon />}
                      />
                    }
                  />
                )
              })}
            </div>
          </section>
        ))
      )}
    </>
  )
}

export default ContentSearchList
