import MediaListItem from './MediaListItem'
import Thumbnail from './Thumbnail'
import EmptyState from './EmptyState'
import { CONTENT_TYPES } from '../data/contentTypes'
import {
  Search,
  Add,
  Book,
  Videocam,
  Mic,
  Tv,
  Movie,
  Bookmark,
  Newspaper,
  Apps,
} from '@nine-thirty-five/material-symbols-react/outlined'
import './ContentSearchList.css'

// Icon fallback per content type (see src/data/contentTypes.js) — kept
// as a lookup here rather than storing components in that data file,
// since that file is also imported by non-UI code paths.
const TYPE_ICONS = { Videocam, Mic, Tv, Movie, Bookmark, Newspaper, Apps }

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
}) {
  return (
    <>
      <div className="content-search-list-row">
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
        <button
          type="button"
          className="content-search-list-add-button"
          onClick={onAddContent}
          aria-label="Adicionar conteúdo"
        >
          <Add />
        </button>
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

      {groups.length === 0 ? (
        <EmptyState
          icon={<Book />}
          title="Nenhum conteúdo ainda"
          description="Toque no + pra adicionar seu primeiro conteúdo"
        />
      ) : (
        groups.map((group) => (
          <section key={group.label} className="content-search-list-group">
            <p className="content-search-list-label">{group.label}</p>
            <div className="content-search-list-card">
              {group.items.map((item, index) => {
                const contentType = CONTENT_TYPES.find((type) => type.key === item.type)
                const Icon = contentType && TYPE_ICONS[contentType.icon]
                return (
                  <MediaListItem
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    divider={index < group.items.length - 1}
                    onClick={() => onItemClick(item)}
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
