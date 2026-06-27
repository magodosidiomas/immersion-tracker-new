import { useEffect, useState } from 'react'
import { getDraftSession, saveDraftSession, deleteDraftSession } from '../db'

const IDLE = {
  status: 'idle',
  accumulatedMs: 0,
  runStartedAt: null,
  firstStartedAt: null,
  languageId: null,
  category: null,
  subcategory: null,
}

// Single shared timer/draft, lifted above Home and NewSession so both
// read the same live state — Home's TimerWidget needs to keep ticking
// even while the person is looking at Home itself, not just inside the
// timer screen. Within one already-open tab, this hook's state is the
// live source of truth; the IndexedDB writes are only so a reload can
// rebuild it (see db.getDraftSession — a recovered 'running' draft
// always comes back already normalized to 'paused').
export function useTimerDraft() {
  const [draft, setDraft] = useState(IDLE)
  const [now, setNow] = useState(() => Date.now())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getDraftSession()
      .then((found) => {
        if (found) setDraft(found)
        setLoaded(true)
      })
      .catch((err) => {
        console.error('Erro ao carregar rascunho do timer:', err)
        setLoaded(true) // still mark as loaded so the app doesn't block forever
      })
  }, [])

  useEffect(() => {
    if (draft.status !== 'running') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [draft.status])

  function start(languageId) {
    const startedAt = Date.now()
    const next = {
      status: 'running',
      accumulatedMs: 0,
      runStartedAt: startedAt,
      firstStartedAt: startedAt,
      languageId,
      category: draft.category,
      subcategory: draft.subcategory,
    }
    setNow(startedAt) // avoid a stale `now` making the first render's elapsed time negative
    setDraft(next)
    saveDraftSession(next)
  }

  function pause() {
    if (draft.status !== 'running') return
    const next = {
      ...draft,
      status: 'paused',
      accumulatedMs: draft.accumulatedMs + (Date.now() - draft.runStartedAt),
      runStartedAt: null,
    }
    setDraft(next)
    saveDraftSession(next)
  }

  function resume() {
    if (draft.status !== 'paused') return
    const resumedAt = Date.now()
    const next = { ...draft, status: 'running', runStartedAt: resumedAt }
    setNow(resumedAt) // same reason as start
    setDraft(next)
    saveDraftSession(next)
  }

  // Freezes the clock (same math as pause) and returns a snapshot for
  // the finish-phase form. The draft itself stays alive — still
  // recoverable as 'paused' — until Salvar or Descartar resolves it via
  // clearDraft(). That also means closing the timer screen mid-finish
  // and coming back later still recovers it (as paused, frozen here).
  function end() {
    const endedAt = Date.now()
    const finalMs = draft.status === 'running' ? draft.accumulatedMs + (endedAt - draft.runStartedAt) : draft.accumulatedMs
    const next = { ...draft, status: 'paused', accumulatedMs: finalMs, runStartedAt: null }
    setDraft(next)
    saveDraftSession(next)
    return {
      durationSeconds: Math.round(finalMs / 1000),
      startAt: new Date(draft.firstStartedAt),
      endAt: new Date(endedAt),
    }
  }

  function setCategorySelection(category, subcategory) {
    const next = { ...draft, category, subcategory }
    setDraft(next)
    saveDraftSession(next)
  }

  // Used both after a successful Salvar (the draft became a real
  // Session) and after Descartar (thrown away) — either way the draft
  // itself just goes back to idle and disappears from IndexedDB.
  function clearDraft() {
    setDraft(IDLE)
    deleteDraftSession()
  }

  // Math.max(0, ...) prevents a negative display on the very first
  // render after start()/resume(), when state updates are batched but
  // `now` might still reflect the pre-start value.
  const liveMs =
    draft.status === 'running' && draft.runStartedAt !== null
      ? Math.max(0, draft.accumulatedMs + (now - draft.runStartedAt))
      : draft.accumulatedMs

  return { ...draft, liveMs, loaded, start, pause, resume, end, setCategorySelection, clearDraft }
}
