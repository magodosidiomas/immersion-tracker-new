// Thin data-access layer over IndexedDB for Imerso.
//
// Nothing outside this file should know IndexedDB exists. If we ever swap
// to a real backend (e.g. Supabase), only this file needs to change —
// every function below keeps the same name and shape.

const DB_NAME = 'imerso'
const DB_VERSION = 2
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
  const sessions = await getSessionsByLanguage(languageId)
  for (const session of sessions) {
    await remove('sessions', session.id)
  }
  await remove('languages', languageId)

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
  for (let index = 0; index < orderedIds.length; index += 1) {
    const language = await getOne('languages', orderedIds[index])
    if (language) await put('languages', { ...language, order: index })
  }
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
