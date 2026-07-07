// Content types for the "Novo/editar conteúdo" form and the Biblioteca.
// Keys match the category chips in Figma exactly (not just icon
// fallback groups — the type also decides which fields the form
// shows: link+autofill for youtube/podcast, search+create for
// serie/filme, título+autor for livro, and so on).
export const CONTENT_TYPES = [
  { key: 'youtube', label: 'YouTube', icon: 'Videocam' },
  { key: 'podcast', label: 'Podcast', icon: 'Mic' },
  { key: 'serie', label: 'Série', icon: 'Tv' },
  { key: 'filme', label: 'Filme', icon: 'Movie' },
  { key: 'livro', label: 'Livro', icon: 'Bookmark' },
  { key: 'website', label: 'Website', icon: 'Newspaper' },
  { key: 'outro', label: 'Outro', icon: 'Apps' },
]
