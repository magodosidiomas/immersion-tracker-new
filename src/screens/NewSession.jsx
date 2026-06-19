import { useEffect, useState } from 'react'
import TopNav from '../components/TopNav'
import Dropdown from '../components/Dropdown'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import SelectionChip from '../components/SelectionChip'
import SessionForm from '../components/SessionForm'
import { Close, PlayArrow, Pause, Stop, ArrowBack, Delete } from '@nine-thirty-five/material-symbols-react/outlined'
import { CATEGORIES } from '../data/categories'
import { getAppSettings, createSession } from '../db'
import { formatDateInput, pad2 } from '../utils/date'
// Pulls in .category-sheet-* (used by the picker sheet below) and
// .finish-session-* (used by SessionForm) — shared with EditSession.
import '../components/SessionForm.css'
import './NewSession.css'

// Three timer states (idle / running / paused), plus a "finish" phase
// once "Encerrar" is pressed. No IndexedDB writes happen for the
// running timer itself — per the locked MVP decision, it lives purely
// in memory, and closing/reloading loses it. There's nothing to resume
// on mount either; this screen always starts idle.
//
// Elapsed time is accumulatedMs (frozen total from past running
// segments) plus the live segment in progress, recomputed from
// Date.now() every tick rather than just incrementing a counter — the
// same drift-resistant shape the future IndexedDB draft-session
// persistence is planned to use (status + startTime timestamp, see the
// data model doc), so wiring real persistence in later is additive
// instead of a rewrite of how time itself is measured.
//
// The category Dropdown opens a bottom sheet to pick category +
// subcategory (SelectionChip) while the timer is running/paused. The
// sheet has its own pending* draft state so "Cancelar" can discard
// edits instead of applying each tap live — only "Salvar" commits to
// category/subcategory, which is what the Dropdown displays. Picking a
// category isn't required to start the timer, so the timer flow isn't
// blocked by leaving it unset.
//
// "Encerrar" freezes the clock (same math as a pause) and switches to
// the "finish" phase, which renders the session-details form below
// (duration/início/fim/data + category/subcategory, editable, then
// Salvar writes the session to IndexedDB, or Descartar discards it).
// The top nav's back arrow on that phase returns to "timer" with the
// frozen paused state intact — so changing your mind about ending just
// resumes from exactly where Encerrar left it.
function NewSession({ onClose }) {
  const [phase, setPhase] = useState('timer') // timer | finish
  const [status, setStatus] = useState('idle') // idle | running | paused
  const [accumulatedMs, setAccumulatedMs] = useState(0)
  const [runStartedAt, setRunStartedAt] = useState(null)
  const [firstStartedAt, setFirstStartedAt] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const [activeLanguageId, setActiveLanguageId] = useState(null)

  // Snapshot handed to the finish-phase form the moment Encerrar is
  // pressed — its own state from there on, edited independently of the
  // timer above.
  const [finishDraft, setFinishDraft] = useState(null)

  // Committed selection — what the Dropdown trigger displays. null
  // until the sheet's been saved at least once.
  const [category, setCategory] = useState(null)
  const [subcategory, setSubcategory] = useState(null)

  // Draft selection while the sheet is open, seeded from the committed
  // values (or the first category/subcategory if nothing's committed
  // yet) each time it opens.
  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const [pendingCategory, setPendingCategory] = useState(CATEGORIES[0].key)
  const [pendingSubcategory, setPendingSubcategory] = useState(CATEGORIES[0].subcategories[0].key)

  useEffect(() => {
    getAppSettings().then((settings) => setActiveLanguageId(settings.activeLanguageId))
  }, [])

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [status])

  function handleStart() {
    const startedAt = Date.now()
    setFirstStartedAt(startedAt)
    setRunStartedAt(startedAt)
    setNow(startedAt) // avoid a stale `now` making the first render's elapsed time negative
    setStatus('running')
  }

  function handlePause() {
    setAccumulatedMs((ms) => ms + (Date.now() - runStartedAt))
    setRunStartedAt(null)
    setStatus('paused')
  }

  function handleResume() {
    const resumedAt = Date.now()
    setRunStartedAt(resumedAt)
    setNow(resumedAt) // same reason as handleStart
    setStatus('running')
  }

  function handleEnd() {
    const endedAt = Date.now()
    const finalMs = status === 'running' ? accumulatedMs + (endedAt - runStartedAt) : accumulatedMs
    // Freeze the clock — same effect as a pause — so going back from
    // the finish phase resumes from exactly this point instead of
    // having kept counting in the background.
    setAccumulatedMs(finalMs)
    setRunStartedAt(null)
    setStatus('paused')
    setFinishDraft({
      durationSeconds: Math.round(finalMs / 1000),
      startAt: new Date(firstStartedAt),
      endAt: new Date(endedAt),
    })
    setPhase('finish')
  }

  function openCategorySheet() {
    setPendingCategory(category ?? CATEGORIES[0].key)
    setPendingSubcategory(subcategory ?? CATEGORIES[0].subcategories[0].key)
    setCategorySheetOpen(true)
  }

  function handlePickCategory(key) {
    setPendingCategory(key)
    // Switching category resets the subcategory to that category's
    // first option — the previous pick may not even exist on this one
    // (e.g. "vocabulario" isn't a subcategory of "imersao").
    setPendingSubcategory(CATEGORIES.find((item) => item.key === key).subcategories[0].key)
  }

  function handleSaveCategory() {
    setCategory(pendingCategory)
    setSubcategory(pendingSubcategory)
    setCategorySheetOpen(false)
  }

  // Math.max(0, ...) prevents a negative display on the very first
  // render after Start is pressed, when state updates are batched but
  // `now` might still reflect the pre-start value.
  const liveMs = Math.max(0, status === 'running' && runStartedAt !== null ? accumulatedMs + (now - runStartedAt) : accumulatedMs)
  const totalSeconds = Math.floor(liveMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  // MM:SS while under an hour, expands to H:MM:SS past it — leaner for
  // the common case (most sessions land under 1h) instead of always
  // paying for a zeroed-out hours segment. The history list and the
  // duração edit sheet stay fixed HH:MM:SS on purpose (list alignment /
  // an always-editable field), so this expansion is local to the live
  // running timer only.
  const display =
    hours > 0 ? `${hours}:${pad2(minutes)}:${pad2(seconds)}` : `${pad2(minutes)}:${pad2(seconds)}`

  const categoryData = CATEGORIES.find((item) => item.key === category)
  const subcategoryLabel = categoryData?.subcategories.find((item) => item.key === subcategory)?.label
  const pendingCategoryData = CATEGORIES.find((item) => item.key === pendingCategory)

  if (phase === 'finish') {
    return (
      <FinishSession
        draft={finishDraft}
        category={category}
        subcategory={subcategory}
        languageId={activeLanguageId}
        onBack={() => setPhase('timer')}
        onDiscard={onClose}
        onSaved={onClose}
      />
    )
  }

  return (
    <main className="new-session">
      <TopNav
        title="Nova sessão"
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onClose} aria-label="Fechar">
            <Close />
          </button>
        }
      />
      <div className="new-session-body">
        <Dropdown
          label={categoryData ? categoryData.label : 'Selecionar categoria'}
          secondaryLabel={subcategoryLabel}
          selected={Boolean(categoryData)}
          onClick={openCategorySheet}
        />
        <span className="new-session-timer">{display}</span>
      </div>
      <div className="new-session-footer">
        {status === 'idle' && (
          <Button leadingIcon={<PlayArrow />} fullWidth onClick={handleStart}>
            Iniciar
          </Button>
        )}
        {status === 'running' && (
          <>
            <Button leadingIcon={<Pause />} fullWidth onClick={handlePause}>
              Pausar
            </Button>
            <Button variant="outline" leadingIcon={<Stop />} fullWidth onClick={handleEnd}>
              Encerrar
            </Button>
          </>
        )}
        {status === 'paused' && (
          <>
            <Button leadingIcon={<PlayArrow />} fullWidth onClick={handleResume}>
              Retomar
            </Button>
            <Button variant="outline" leadingIcon={<Stop />} fullWidth onClick={handleEnd}>
              Encerrar
            </Button>
          </>
        )}
      </div>
      <BottomSheet
        open={categorySheetOpen}
        onClose={() => setCategorySheetOpen(false)}
        title="Escolher categoria"
        contentCard={false}
        primaryButton={
          <Button fullWidth onClick={handleSaveCategory}>
            Salvar
          </Button>
        }
        secondaryButton={
          <Button variant="ghost" onClick={() => setCategorySheetOpen(false)}>
            Cancelar
          </Button>
        }
      >
        <div className="category-sheet-group">
          <span className="category-sheet-label">Categoria</span>
          <div className="category-sheet-chips">
            {CATEGORIES.map((item) => (
              <SelectionChip
                key={item.key}
                label={item.label}
                hasLeadingIcon={false}
                hasTrailingIcon={false}
                selected={pendingCategory === item.key}
                onClick={() => handlePickCategory(item.key)}
              />
            ))}
          </div>
        </div>
        <div className="category-sheet-group">
          <span className="category-sheet-label">Subcategoria</span>
          <div className="category-sheet-chips">
            {pendingCategoryData.subcategories.map((item) => (
              <SelectionChip
                key={item.key}
                label={item.label}
                hasLeadingIcon={false}
                hasTrailingIcon={false}
                selected={pendingSubcategory === item.key}
                onClick={() => setPendingSubcategory(item.key)}
              />
            ))}
          </div>
        </div>
      </BottomSheet>
    </main>
  )
}

// The session-details form shown after "Encerrar". Owns its own
// editable state (duration/início/fim/data/category/subcategory),
// seeded once from `draft` (the frozen timer snapshot) — it doesn't
// keep syncing with the timer above, since by this point the clock is
// frozen and only this form's own edits should move the numbers.
//
// Edit rules (locked in imerso-data-model.md):
// - editing duração recalculates fim, início stays put
// - editing início or fim recalculates duração, the other stays put
// - impossible combinations (fim before início) are blocked by simply
//   not applying the edit — the controlled input snaps back to its
//   last valid value.
// "Data" is independent of those three — it's which calendar day the
// session counts toward (for future dashboards/streaks), not part of
// the duration math, so it defaults to today and is edited on its own.
function FinishSession({ draft, category, subcategory, languageId, onBack, onDiscard, onSaved }) {
  const [saving, setSaving] = useState(false)

  async function handleSave(fields) {
    if (!languageId || saving) return
    setSaving(true)
    await createSession({ languageId, ...fields })
    onSaved()
  }

  return (
    <main className="new-session">
      <TopNav
        title="Nova sessão"
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
      />
      <SessionForm
        initialStartAt={draft.startAt}
        initialDurationSeconds={draft.durationSeconds}
        initialDate={formatDateInput(new Date())}
        initialCategory={category}
        initialSubcategory={subcategory}
        onSave={handleSave}
        saving={saving}
        secondaryButton={
          <Button variant="destructive-ghost" leadingIcon={<Delete />} fullWidth onClick={onDiscard}>
            Descartar sessão
          </Button>
        }
      />
    </main>
  )
}

export default NewSession
