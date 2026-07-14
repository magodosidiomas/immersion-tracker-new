// Thin data-access layer over IndexedDB for Imerso.
//
// Nothing outside this file should know IndexedDB exists. If we ever swap
// to a real backend (e.g. Supabase), only this file needs to change —
// every function below keeps the same name and shape.

const DB_NAME = 'imerso'
const DB_VERSION = 3
const SETTINGS_ID = 'app-settings'
const DRAFT_ID = 'timer-draft'

let dbPromise = null

function openDB() {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      if (!db.objectStoreNames.contains('languages')) {
        db.createObjectStore('languages', { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains('sessions')) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' })
        sessions.createIndex('languageId', 'languageId')
      }

      if (!db.objectStoreNames.contains('appSettings')) {
        db.createObjectStore('appSettings', { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains('timerDraft')) {
        db.createObjectStore('timerDraft', { keyPath: 'id' })
      }

      // Content catalog: the named, reusable "séries"/"filmes" entries
      // managed from Settings > Conteúdo (Gerenciar séries/filmes) —
      // independent of any specific content item, so a série can exist
      // (and have episodes) before any content/session references it.
      if (!db.objectStoreNames.contains('contentCatalog')) {
        const catalog = db.createObjectStore('contentCatalog', { keyPath: 'id' })
        catalog.createIndex('languageId', 'languageId')
      }

      // One row per episode of a série (season/episode numbers only —
      // the título is always derived by joining to its catalog entry).
      if (!db.objectStoreNames.contains('episodes')) {
        const episodes = db.createObjectStore('episodes', { keyPath: 'id' })
        episodes.createIndex('catalogId', 'catalogId')
      }

      // The actual Biblioteca items. youtube/podcast/website/outro/
      // livro carry their own title/link/thumbnail/author directly;
      // serie/filme instead carry a catalogId (+ episodeId for serie)
      // and their título/thumbnail are derived by joining at read time.
      if (!db.objectStoreNames.contains('contents')) {
        const contents = db.createObjectStore('contents', { keyPath: 'id' })
        contents.createIndex('languageId', 'languageId')
        contents.createIndex('catalogId', 'catalogId')
        contents.createIndex('episodeId', 'episodeId')
      }

      // Session <-> content join table (many-to-many).
      if (!db.objectStoreNames.contains('sessionContents')) {
        const sessionContents = db.createObjectStore('sessionContents', { keyPath: 'id' })
        sessionContents.createIndex('sessionId', 'sessionId')
        sessionContents.createIndex('contentId', 'contentId')
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return dbPromise
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getAll(storeName) {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readonly')
  return requestToPromise(tx.objectStore(storeName).getAll())
}

async function getAllByIndex(storeName, indexName, value) {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readonly')
  return requestToPromise(tx.objectStore(storeName).index(indexName).getAll(value))
}

async function getOne(storeName, key) {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readonly')
  return requestToPromise(tx.objectStore(storeName).get(key))
}

async function put(storeName, value) {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readwrite')
  await requestToPromise(tx.objectStore(storeName).put(value))
  return value
}

async function remove(storeName, key) {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readwrite')
  return requestToPromise(tx.objectStore(storeName).delete(key))
}

async function clearStore(storeName) {
  const db = await openDB()
  const tx = db.transaction(storeName, 'readwrite')
  return requestToPromise(tx.objectStore(storeName).clear())
}

function generateId() {
  return crypto.randomUUID()
}

// ---------- Languages ----------

// A flag emoji is two regional-indicator letters offset from the
// alphabet (e.g. 🇺🇸 = U+1F1FA U+1F1F8 = "u" "s"), so a record saved
// before the flagCode migration can be converted back to its 2-letter
// code without a lookup table.
function emojiToFlagCode(emoji) {
  return Array.from(emoji)
    .map((char) => String.fromCharCode(char.codePointAt(0) - 0x1f1e6 + 97))
    .join('')
}

export async function getLanguages() {
  const languages = await getAll('languages')
  return languages
    .map((language) => ({
      ...language,
      flagCode: language.flagCode ?? emojiToFlagCode(language.flagEmoji),
    }))
    .sort((a, b) => a.order - b.order)
}

export async function addLanguage({ name, flagCode }) {
  const languages = await getLanguages()
  const language = {
    id: generateId(),
    name,
    flagCode,
    order: languages.length,
  }
  await put('languages', language)

  // First language added becomes the active one automatically.
  const settings = await getAppSettings()
  if (!settings.activeLanguageId) {
    await setActiveLanguageId(language.id)
  }

  return language
}

// Cascade delete: removes the language and every session that belongs to
// it. If it was the active language, falls back to whichever language is
// next, or null if none are left. The confirmation screen that should
// precede this call is a separate, not-yet-built piece.
export async function removeLanguage(languageId) {
  const [sessions, contents, catalogEntries, allSessionContents, allEpisodes] = await Promise.all([
    getSessionsByLanguage(languageId),
    getAllByIndex('contents', 'languageId', languageId),
    getAllByIndex('contentCatalog', 'languageId', languageId),
    getAll('sessionContents'),
    getAll('episodes'),
  ])
  const contentIds = contents.map((content) => content.id)
  const catalogIds = catalogEntries.map((entry) => entry.id)
  const episodesToRemove = allEpisodes.filter((episode) => catalogIds.includes(episode.catalogId))
  const linksToRemove = allSessionContents.filter((link) => contentIds.includes(link.contentId))

  await Promise.all([
    ...sessions.map((session) => remove('sessions', session.id)),
    ...linksToRemove.map((link) => remove('sessionContents', link.id)),
    ...contents.map((content) => remove('contents', content.id)),
    ...episodesToRemove.map((episode) => remove('episodes', episode.id)),
    ...catalogEntries.map((entry) => remove('contentCatalog', entry.id)),
    remove('languages', languageId),
  ])

  const draft = await getOne('timerDraft', DRAFT_ID)
  if (draft?.languageId === languageId) {
    await remove('timerDraft', DRAFT_ID)
  }

  const settings = await getAppSettings()
  if (settings.activeLanguageId === languageId) {
    const remaining = await getLanguages()
    await setActiveLanguageId(remaining[0]?.id ?? null)
  }
}

// Persists a new manual order after a drag-and-drop reorder. Takes the
// full list of language IDs in their new order and rewrites each one's
// `order` field to match its index — same field getLanguages() already
// sorts by, so this is the only function that needs to know reordering
// exists.
export async function reorderLanguages(orderedIds) {
  const languages = await Promise.all(orderedIds.map((id) => getOne('languages', id)))
  await Promise.all(
    languages.map((language, index) => language && put('languages', { ...language, order: index }))
  )
}

// ---------- App settings ----------

export async function getAppSettings() {
  const settings = await getOne('appSettings', SETTINGS_ID)
  return settings ?? { id: SETTINGS_ID, activeLanguageId: null }
}

export async function setActiveLanguageId(languageId) {
  const settings = await getAppSettings()
  await put('appSettings', { ...settings, activeLanguageId: languageId })
}

// ---------- Sessions ----------

export async function getSessionsByLanguage(languageId) {
  return getAllByIndex('sessions', 'languageId', languageId)
}

export async function createSession(sessionData) {
  const session = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    ...sessionData,
  }
  await put('sessions', session)
  return session
}

// Overwrites an existing session in place (id and languageId unchanged
// — editing a session never moves it to a different language).
export async function updateSession(session) {
  await put('sessions', session)
  return session
}

export async function deleteSession(sessionId) {
  await remove('sessions', sessionId)
}

// ---------- Content catalog (séries/filmes) ----------

// Adding a filme immediately creates its (single) linkable content
// row too — a filme has nothing further to configure, so it can be
// linked to sessions right away. A série instead only becomes
// linkable episode by episode (see addEpisode), since the point of
// the extra layer is picking which episode a session covers.
export async function addCatalogEntry(languageId, kind, name) {
  const entry = { id: generateId(), languageId, kind, name }
  await put('contentCatalog', entry)
  if (kind === 'filme') {
    await put('contents', {
      id: generateId(),
      languageId,
      type: 'filme',
      catalogId: entry.id,
      createdAt: new Date().toISOString(),
    })
  }
  return entry
}

export async function renameCatalogEntry(id, name) {
  const entry = await getOne('contentCatalog', id)
  if (!entry) return
  await put('contentCatalog', { ...entry, name })
}

// Cascade delete: the catalog entry, its episodes (if a série), every
// content row referencing it (directly, or through one of its
// episodes), and every session<->content link for those content rows.
export async function deleteCatalogEntry(id) {
  const [episodes, allContents, allSessionContents] = await Promise.all([
    getAllByIndex('episodes', 'catalogId', id),
    getAll('contents'),
    getAll('sessionContents'),
  ])
  const episodeIds = episodes.map((episode) => episode.id)
  const relatedContents = allContents.filter(
    (content) => content.catalogId === id || episodeIds.includes(content.episodeId),
  )
  const contentIds = relatedContents.map((content) => content.id)
  const relatedLinks = allSessionContents.filter((link) => contentIds.includes(link.contentId))

  await Promise.all([
    ...relatedLinks.map((link) => remove('sessionContents', link.id)),
    ...relatedContents.map((content) => remove('contents', content.id)),
    ...episodes.map((episode) => remove('episodes', episode.id)),
    remove('contentCatalog', id),
  ])
}

// languageId + kind together, since séries and filmes are both stored
// in the same store — used by ContentForm's SearchCreateField and
// Settings > Gerenciar séries/filmes.
export async function getContentCatalog(languageId, kind) {
  const [all, contents, episodes, sessionContents] = await Promise.all([
    getAllByIndex('contentCatalog', 'languageId', languageId),
    getAll('contents'),
    getAll('episodes'),
    getAll('sessionContents'),
  ])
  const filtered = kind ? all.filter((entry) => entry.kind === kind) : all

  return filtered
    .map((entry) => {
      const episodeIds = episodes.filter((ep) => ep.catalogId === entry.id).map((ep) => ep.id)
      const relatedContentIds = contents
        .filter((content) => content.catalogId === entry.id || episodeIds.includes(content.episodeId))
        .map((content) => content.id)
      const sessionCount = sessionContents.filter((link) => relatedContentIds.includes(link.contentId)).length
      return { ...entry, sessionCount }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ---------- Episodes ----------

export async function getEpisodes(catalogId) {
  const [episodes, contents, sessionContents] = await Promise.all([
    getAllByIndex('episodes', 'catalogId', catalogId),
    getAll('contents'),
    getAll('sessionContents'),
  ])
  return episodes
    .map((episode) => {
      const content = contents.find((c) => c.episodeId === episode.id)
      const sessionCount = content
        ? sessionContents.filter((link) => link.contentId === content.id).length
        : 0
      return { ...episode, contentId: content?.id ?? null, sessionCount }
    })
    .sort((a, b) => a.season - b.season || a.episode - b.episode)
}

// An episode is itself a linkable content item (type 'serie') from
// the moment it's created — sessions link to the episode, not to a
// separately-created content row, so this always creates both in one
// call. Reused as find-or-create by createContent below (série save
// path), since re-adding the same season/episode should reuse the row.
export async function addEpisode(catalogId, season, episode) {
  const existing = await getAllByIndex('episodes', 'catalogId', catalogId)
  const already = existing.find((ep) => ep.season === season && ep.episode === episode)
  if (already) return already

  const record = { id: generateId(), catalogId, season, episode }
  await put('episodes', record)
  const catalogEntry = await getOne('contentCatalog', catalogId)
  await put('contents', {
    id: generateId(),
    languageId: catalogEntry?.languageId ?? null,
    type: 'serie',
    catalogId,
    episodeId: record.id,
    createdAt: new Date().toISOString(),
  })
  return record
}

export async function deleteEpisode(id) {
  const [allContents, allSessionContents] = await Promise.all([getAll('contents'), getAll('sessionContents')])
  const related = allContents.filter((content) => content.episodeId === id)
  const relatedIds = related.map((content) => content.id)
  const relatedLinks = allSessionContents.filter((link) => relatedIds.includes(link.contentId))
  await Promise.all([
    ...relatedLinks.map((link) => remove('sessionContents', link.id)),
    ...related.map((content) => remove('contents', content.id)),
    remove('episodes', id),
  ])
}

// ---------- Contents (Biblioteca items) ----------

// Resolves título for the two catalog-backed types by joining to
// contentCatalog/episodes — every other type already carries its own
// título directly on the row.
async function resolveContentTitle(content) {
  if (content.type === 'serie') {
    const [catalogEntry, episode] = await Promise.all([
      getOne('contentCatalog', content.catalogId),
      getOne('episodes', content.episodeId),
    ])
    if (!catalogEntry || !episode) return content.title ?? null
    return `${catalogEntry.name} · T${episode.season} E${episode.episode}`
  }
  if (content.type === 'filme') {
    const catalogEntry = await getOne('contentCatalog', content.catalogId)
    return catalogEntry?.name ?? null
  }
  return content.title ?? null
}

// Plain create for every type except serie/filme, which go through
// addEpisode/addCatalogEntry instead (their content row is a side
// effect of that, not a standalone create call) — ContentForm calls
// this one only for youtube/podcast/website/livro/outro.
export async function createContent(data) {
  const content = { id: generateId(), createdAt: new Date().toISOString(), ...data }
  await put('contents', content)
  return content
}

export async function updateContent(content) {
  await put('contents', content)
  return content
}

export async function deleteContent(id) {
  const links = await getAllByIndex('sessionContents', 'contentId', id)
  await Promise.all([...links.map((link) => remove('sessionContents', link.id)), remove('contents', id)])
}

// Biblioteca's full list for the active language — each item resolved
// with its título, session count, and most recent linked session date
// (raw 'YYYY-MM-DD', null if never linked). Screens derive display
// strings (day-group headers, "N sessões" subtitles) from these raw
// values via utils, keeping this file format-agnostic.
export async function getContentsByLanguage(languageId) {
  const [contents, sessionContents, sessions] = await Promise.all([
    getAllByIndex('contents', 'languageId', languageId),
    getAll('sessionContents'),
    getSessionsByLanguage(languageId),
  ])
  const sessionById = Object.fromEntries(sessions.map((session) => [session.id, session]))

  const resolved = await Promise.all(
    contents.map(async (content) => {
      const title = await resolveContentTitle(content)
      const links = sessionContents.filter((link) => link.contentId === content.id)
      const linkedSessions = links.map((link) => sessionById[link.sessionId]).filter(Boolean)
      const sessionCount = linkedSessions.length
      const latestSessionDate = linkedSessions.reduce(
        (latest, session) => (!latest || session.date > latest ? session.date : latest),
        null,
      )
      return { ...content, title, sessionCount, latestSessionDate }
    }),
  )

  return resolved.sort((a, b) => (b.latestSessionDate ?? '').localeCompare(a.latestSessionDate ?? ''))
}

// Single resolved content row, for EditContent's prefill — includes
// the joined título plus raw season/episode/related name for série/
// filme types, since ContentForm's search field and Temporada/Episódio
// inputs need those raw values, not just the joined display string.
export async function getContent(id) {
  const content = await getOne('contents', id)
  if (!content) return null
  const title = await resolveContentTitle(content)
  let season, episodeNumber, relatedName
  if (content.type === 'serie' && content.episodeId) {
    const episode = await getOne('episodes', content.episodeId)
    season = episode?.season
    episodeNumber = episode?.episode
  }
  if (content.catalogId) {
    const catalogEntry = await getOne('contentCatalog', content.catalogId)
    relatedName = catalogEntry?.name
  }
  return { ...content, title, season, episode: episodeNumber, relatedName }
}

// Find-or-create the content row for a given catalogId+season+episode
// (via addEpisode) and return that content row directly — this is
// what ContentForm's save path calls for type 'serie', since the
// episode/content pair is a side effect of picking a season+episode,
// not something created independently.
export async function saveSerieContent(catalogId, season, episode) {
  const episodeRecord = await addEpisode(catalogId, season, episode)
  const contents = await getAllByIndex('contents', 'episodeId', episodeRecord.id)
  return contents[0]
}

// A filme's single content row was already created alongside its
// catalog entry (see addCatalogEntry) — this just looks it up.
export async function getFilmeContent(catalogId) {
  const contents = await getAllByIndex('contents', 'catalogId', catalogId)
  return contents.find((content) => content.type === 'filme')
}

// ---------- Session <-> Content links ----------

export async function linkSessionContent(sessionId, contentId) {
  const existing = await getAllByIndex('sessionContents', 'sessionId', sessionId)
  if (existing.some((link) => link.contentId === contentId)) return
  await put('sessionContents', { id: generateId(), sessionId, contentId })
}

export async function unlinkSessionContent(sessionId, contentId) {
  const existing = await getAllByIndex('sessionContents', 'sessionId', sessionId)
  const link = existing.find((item) => item.contentId === contentId)
  if (link) await remove('sessionContents', link.id)
}

// Contents linked to one session, resolved (título etc.) for
// SessionForm's "Conteúdos vinculados" list.
export async function getContentsForSession(sessionId) {
  const links = await getAllByIndex('sessionContents', 'sessionId', sessionId)
  const contents = await Promise.all(links.map((link) => getOne('contents', link.contentId)))
  return Promise.all(
    contents.filter(Boolean).map(async (content) => ({ ...content, title: await resolveContentTitle(content) })),
  )
}

// Sessions linked to one content item, for ContentForm/EpisodeDetail's
// "Sessões vinculadas" list. Returns raw Session rows — the screen
// formats label/description via sessionLabel/formatDuration, same as
// every other session list in the app.
export async function getSessionsForContent(contentId) {
  const links = await getAllByIndex('sessionContents', 'contentId', contentId)
  const sessions = await Promise.all(links.map((link) => getOne('sessions', link.sessionId)))
  return sessions.filter(Boolean)
}

// ---------- Timer draft ----------

// Singleton draft for the one timer that can exist at a time (see
// imerso-data-model.md). Lives in its own store, not `sessions` — it
// isn't a real session until Salvar is pressed in the finish phase.
//
// A draft recovered with status 'running' is always normalized to
// 'paused' here, freezing accumulatedMs at the full wall-clock gap —
// nobody comes back to a silently-still-counting timer; resuming is an
// explicit tap. The normalization is persisted immediately so repeat
// reads stay consistent.
export async function getDraftSession() {
  const draft = await getOne('timerDraft', DRAFT_ID)
  if (!draft) return null
  if (draft.status === 'running') {
    const normalized = {
      ...draft,
      status: 'paused',
      accumulatedMs: draft.accumulatedMs + (Date.now() - draft.runStartedAt),
      runStartedAt: null,
    }
    await put('timerDraft', normalized)
    return normalized
  }
  return draft
}

export async function saveDraftSession(draft) {
  await put('timerDraft', { ...draft, id: DRAFT_ID })
}

export async function deleteDraftSession() {
  await remove('timerDraft', DRAFT_ID)
}

// ---------- Backup (export / import) ----------

// Everything a restore needs to fully recreate the user's data.
// timerDraft is deliberately excluded — an in-progress timer is
// transient app state, not data worth carrying into a backup file.
export async function exportData() {
  const [languages, sessions, appSettings, contentCatalog, episodes, contents, sessionContents] = await Promise.all([
    getAll('languages'),
    getAll('sessions'),
    getAppSettings(),
    getAll('contentCatalog'),
    getAll('episodes'),
    getAll('contents'),
    getAll('sessionContents'),
  ])
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    languages,
    sessions,
    appSettings,
    contentCatalog,
    episodes,
    contents,
    sessionContents,
  }
}

// Full replace, not a merge: wipes languages/sessions/appSettings/
// timerDraft and writes the imported file in their place. timerDraft is
// cleared even though it isn't part of the export, since a leftover
// draft could otherwise reference a languageId that no longer exists
// after the replace. activeLanguageId falls back to the imported
// file's first language if the original active one wasn't included.
export async function importData(data) {
  const languages = Array.isArray(data?.languages) ? data.languages : []
  const sessions = Array.isArray(data?.sessions) ? data.sessions : []
  const contentCatalog = Array.isArray(data?.contentCatalog) ? data.contentCatalog : []
  const episodes = Array.isArray(data?.episodes) ? data.episodes : []
  const contents = Array.isArray(data?.contents) ? data.contents : []
  const sessionContents = Array.isArray(data?.sessionContents) ? data.sessionContents : []

  await Promise.all([
    clearStore('languages'),
    clearStore('sessions'),
    clearStore('appSettings'),
    clearStore('timerDraft'),
    clearStore('contentCatalog'),
    clearStore('episodes'),
    clearStore('contents'),
    clearStore('sessionContents'),
  ])

  await Promise.all([
    ...languages.map((language) => put('languages', language)),
    ...sessions.map((session) => put('sessions', session)),
    ...contentCatalog.map((entry) => put('contentCatalog', entry)),
    ...episodes.map((episode) => put('episodes', episode)),
    ...contents.map((content) => put('contents', content)),
    ...sessionContents.map((link) => put('sessionContents', link)),
  ])

  const importedActiveId = data?.appSettings?.activeLanguageId
  const activeLanguageId = languages.some((language) => language.id === importedActiveId)
    ? importedActiveId
    : (languages[0]?.id ?? null)
  await put('appSettings', { id: SETTINGS_ID, activeLanguageId })
}
