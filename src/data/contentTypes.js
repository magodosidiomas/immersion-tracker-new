// Content types for the Biblioteca. Icon fallback shown in Thumbnail
// when a content item has no cover image (e.g. no YouTube/book cover
// found). Anime/manga map onto Série/Livro — there's no separate
// sourceType, per design decision.
export const CONTENT_TYPES = [
  { key: 'video', label: 'Vídeo', icon: 'Videocam' },
  { key: 'podcast', label: 'Podcast', icon: 'Mic' },
  { key: 'serie', label: 'Série', icon: 'Tv' },
  { key: 'filme', label: 'Filme', icon: 'Movie' },
  { key: 'livro', label: 'Livro', icon: 'Bookmark' },
  { key: 'artigo', label: 'Artigo', icon: 'Newspaper' },
  { key: 'outro', label: 'Outro', icon: 'Apps' },
]
