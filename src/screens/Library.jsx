import { useState } from 'react'
import LanguageTopNav from '../components/LanguageTopNav'
import BottomNav from '../components/BottomNav'
import MediaListItem from '../components/MediaListItem'
import Thumbnail from '../components/Thumbnail'
import EmptyState from '../components/EmptyState'
import { CONTENT_TYPES } from '../data/contentTypes'
import {
  Search,
  Add,
  Home as HomeIcon,
  BarChart,
  Book,
  Videocam,
  Mic,
  Tv,
  Movie,
  Bookmark,
  Newspaper,
  Apps,
} from '@nine-thirty-five/material-symbols-react/outlined'
import './Library.css'

// Icon fallback per content type (see src/data/contentTypes.js) — kept
// as a lookup here rather than storing components in that data file,
// since that file is also imported by non-UI code paths.
const TYPE_ICONS = { Videocam, Mic, Tv, Movie, Bookmark, Newspaper, Apps }

// The main Biblioteca tab — search + quick-add, type filter chips
// ("Todos" is exclusive: picking it clears any specific types, and
// picking a specific type drops "Todos"), then a single chronological
// list grouped by day. Deliberately dumb: `items` must already carry
// a precomputed `dateLabel` (Hoje/Ontem/13/04 — that formatting lives
// in utils/date.js and depends on "today", which isn't this
// component's concern) and `type` matching a CONTENT_TYPES key. This
// is the base screen other passes (content detail, drag-reorder,
// etc.) will build on top of.
function Library({
  items = [],
  onOpenNewContent,
  onOpenContent,
  onOpenSettings,
  onOpenManageLanguages,
  onOpenHome,
  onOpenStatistics,
}) {
  const [query, setQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState([])

  function toggleType(key) {
    setSelectedTypes((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    )
  }

  const trimmedQuery = query.trim().toLowerCase()
  const filtered = items.filter((item) => {
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type)
    const matchesQuery =
      !trimmedQuery ||
      item.title?.toLowerCase().includes(trimmedQuery) ||
      item.subtitle?.toLowerCase().includes(trimmedQuery)
    return matchesType && matchesQuery
  })

  const groups = []
  for (const item of filtered) {
    const group = groups.find((g) => g.label === item.dateLabel)
    if (group) group.items.push(item)
    else groups.push({ label: item.dateLabel, items: [item] })
  }

  return (
    <main className="library">
      <LanguageTopNav onOpenSettings={onOpenSettings} onOpenManageLanguages={onOpenManageLanguages} />
      <div className="library-content">
        <div className="library-search-row">
          <div className="library-search-field">
            <Search className="library-search-icon" aria-hidden="true" />
            <input
              className="library-search-input"
              type="text"
              placeholder="Buscar conteúdo"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="library-add-button"
            onClick={onOpenNewContent}
            aria-label="Adicionar conteúdo"
          >
            <Add />
          </button>
        </div>

        <div className="library-filters">
          <button
            type="button"
            className="library-filter-chip"
            data-selected={selectedTypes.length === 0}
            onClick={() => setSelectedTypes([])}
          >
            Todos
          </button>
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.key}
              type="button"
              className="library-filter-chip"
              data-selected={selectedTypes.includes(type.key)}
              onClick={() => toggleType(type.key)}
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
            <section key={group.label} className="library-history-group">
              <p className="library-history-label">{group.label}</p>
              <div className="library-history-card">
                {group.items.map((item, index) => {
                  const contentType = CONTENT_TYPES.find((type) => type.key === item.type)
                  const Icon = contentType && TYPE_ICONS[contentType.icon]
                  return (
                    <MediaListItem
                      key={item.id}
                      title={item.title}
                      subtitle={item.subtitle}
                      divider={index < group.items.length - 1}
                      onClick={() => onOpenContent(item)}
                      thumbnail={
                        <Thumbnail
                          size={item.type === 'livro' ? 'book' : 'sm'}
                          src={item.thumbnailSrc}
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
