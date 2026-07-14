import { useEffect, useRef, useState } from 'react'
import TopNav from '../components/TopNav'
import Dropdown from '../components/Dropdown'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import SelectionChip from '../components/SelectionChip'
import SessionForm from '../components/SessionForm'
import { Close, PlayArrow, Pause, Stop, ArrowBack, Delete, Add } from '@nine-thirty-five/material-symbols-react/outlined'
import Alert from '../components/Alert'
import { CATEGORIES } from '../data/categories'
import { getAppSettings, createSession, linkSessionContent } from '../db'
import { formatElapsed } from '../utils/date'
import { getCategoryLabel } from '../utils/sessions'
// Pulls in .category-sheet-* (used by the picker sheet below) and
// .finish-session-* (used by SessionForm) — shared with EditSession.
import '../components/SessionForm.css'
import './NewSession.css'

// Timer state (status/elapsed/category/etc.) and its actions
// (start/pause/resume/end/...) come from useTimerDraft, lifted to
// App.jsx and shared with Home — both screens read the same live
// timer, which is what lets Home's TimerWidget keep ticking even when
// this screen isn't open. This screen only owns its own UI state: which
// phase it's showing, and the category picker sheet's pending edits.
//
// "Encerrar" freezes the clock (timer.end(), same math as a pause) and
// switches to the "finish" phase, which renders the session-details
// form below (duration/início/fim/data + category/subcategory,
// editable, then Salvar writes the real session and clears the draft,
// or Descartar clears the draft without saving). The top nav's back
// arrow on that phase returns to "timer" with the frozen paused state
// intact — so changing your mind about ending just resumes from
// exactly where Encerrar left it. The draft itself isn't touched by
// going back — only Salvar/Descartar resolve it.
// manualOnly: used when opened from inside the "vincular sessão" flow
// (ContentForm/EpisodeDetail), where the content being linked may not
// be saved yet — running a live timer against it wouldn't make sense,
// so this mode skips the timer phase entirely (straight to manual
// entry) and hides "vincular conteúdo" inside the form, since nested
// pickers aren't supported by the single pickerScreen stack in
// App.jsx. onSaved receives the created session so the caller can
// select it automatically.
function NewSession({ timer, onClose, onOpenLinkContent, manualOnly = false, onSaved, isDesktop = false }) {
  const [phase, setPhase] = useState(manualOnly ? 'finish' : 'timer') // timer | finish
  const [activeLanguageId, setActiveLanguageId] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Snapshot handed to the finish-phase form the moment Encerrar is
  // pressed (or immediately, for manualOnly) — its own state from
  // there on, edited independently of the timer above.
  const [finishDraft, setFinishDraft] = useState(() =>
    manualOnly ? { startAt: new Date(), durationSeconds: 0, manual: true } : null,
  )

  // Draft selection while the sheet is open, seeded from the timer's
  // committed values (or the first category/subcategory if nothing's
  // committed yet) each time it opens.
  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const [pendingCategory, setPendingCategory] = useState(CATEGORIES[0].key)
  const [pendingSubcategory, setPendingSubcategory] = useState(CATEGORIES[0].subcategories[0].key)
  const categoryMenuRef = useRef(null)

  // Desktop: the category picker is an inline menu anchored to the
  // Dropdown, not a modal — so it closes on an outside click instead
  // of an explicit Cancelar button (mobile keeps the BottomSheet with
  // Salvar/Cancelar, untouched).
  useEffect(() => {
    if (!isDesktop || !categorySheetOpen) return
    function handleClickOutside(event) {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setCategorySheetOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDesktop, categorySheetOpen])

  // Only needed for starting a brand new timer (timer.start needs a
  // languageId) — once a draft exists, timer.languageId already holds
  // whichever language was active when it started.
  useEffect(() => {
    getAppSettings().then((settings) => setActiveLanguageId(settings.activeLanguageId))
  }, [])

  // Deletes the in-progress draft outright (no session-details form,
  // unlike Encerrar) — only reachable once a draft exists (running or
  // paused), never from idle. Mirrors FinishSession's Descartar
  // (clearDraft + onClose), just entered from a different point.
  function handleDeleteSession() {
    timer.clearDraft()
    onClose()
  }

  function handleEnd() {
    const snapshot = timer.end()
    setFinishDraft(snapshot)
    setPhase('finish')
  }

  // Registro manual: skips the timer entirely and opens the same
  // session-details form, seeded with "now" for both ends (duration
  // 0 — shown neutral, not as an error, until the user edits it; see
  // SessionForm's `touched` gate).
  function handleManualEntry() {
    const now = new Date()
    setFinishDraft({ startAt: now, durationSeconds: 0, manual: true })
    setPhase('finish')
  }

  function openCategorySheet() {
    setPendingCategory(timer.category ?? CATEGORIES[0].key)
    setPendingSubcategory(timer.subcategory ?? CATEGORIES[0].subcategories[0].key)
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
    timer.setCategorySelection(pendingCategory, pendingSubcategory)
    setCategorySheetOpen(false)
  }

  // Desktop menu: picking a subcategory commits both values right away
  // and closes the menu — there's no separate Salvar step like the
  // mobile BottomSheet has.
  function handlePickSubcategoryDesktop(key) {
    setPendingSubcategory(key)
    timer.setCategorySelection(pendingCategory, key)
    setCategorySheetOpen(false)
  }

  const totalSeconds = Math.floor(timer.liveMs / 1000)
  const display = formatElapsed(totalSeconds)

  const { categoryLabel, subcategoryLabel } = getCategoryLabel(timer.category, timer.subcategory)
  const pendingCategoryData = CATEGORIES.find((item) => item.key === pendingCategory)

  if (phase === 'finish') {
    return (
      <FinishSession
        draft={finishDraft}
        category={timer.category}
        subcategory={timer.subcategory}
        languageId={timer.languageId ?? activeLanguageId}
        autoOpenDuration={Boolean(finishDraft.manual)}
        hideContentSection={manualOnly}
        onOpenLinkContent={onOpenLinkContent}
        onBack={manualOnly ? onClose : () => setPhase('timer')}
        onDiscard={() => {
          if (!manualOnly) timer.clearDraft()
          onClose()
        }}
        onSaved={(session) => {
          if (!manualOnly) timer.clearDraft()
          if (onSaved) {
            onSaved(session)
          } else {
            onClose()
          }
        }}
      />
    )
  }

  const cardTitle = timer.status === 'running' ? 'Sessão em andamento' : 'Nova sessão'
  const canDelete = timer.status === 'paused'

  const body = (
    <>
      {isDesktop ? (
        <div className="new-session-card-header">
          <span className="new-session-card-title">{cardTitle}</span>
          <button type="button" className="new-session-card-close" onClick={onClose} aria-label="Fechar">
            <Close />
          </button>
        </div>
      ) : (
        <TopNav
          title="Nova sessão"
          hasDivider
          leadingIcon={
            <button type="button" className="top-nav-icon-reset" onClick={onClose} aria-label="Fechar">
              <Close />
            </button>
          }
        />
      )}
      <div className="new-session-body">
        <div className="new-session-category-anchor" ref={categoryMenuRef}>
          <Dropdown
            label={categoryLabel ?? 'Selecionar categoria'}
            secondaryLabel={subcategoryLabel}
            selected={Boolean(categoryLabel)}
            data-open={isDesktop && categorySheetOpen}
            onClick={openCategorySheet}
          />
          {isDesktop && categorySheetOpen && (
            <div className="new-session-category-menu">
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
                      onClick={() => handlePickSubcategoryDesktop(item.key)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <span className="new-session-timer">{display}</span>
      </div>
      <div className="new-session-footer">
        {timer.status === 'idle' && (
          <>
            <Button leadingIcon={<PlayArrow />} fullWidth disabled={!activeLanguageId} onClick={() => timer.start(activeLanguageId)}>
              Iniciar
            </Button>
            <Button variant="outline" leadingIcon={<Add />} fullWidth onClick={handleManualEntry}>
              Registro manual
            </Button>
          </>
        )}
        {timer.status === 'running' && (
          <>
            <Button variant="warning" leadingIcon={<Pause />} fullWidth onClick={timer.pause}>
              Pausar
            </Button>
            <Button variant="outline" leadingIcon={<Stop />} fullWidth onClick={handleEnd}>
              Encerrar
            </Button>
          </>
        )}
        {timer.status === 'paused' && (
          <>
            <Button leadingIcon={<PlayArrow />} fullWidth onClick={timer.resume}>
              Retomar
            </Button>
            <Button variant="outline" leadingIcon={<Stop />} fullWidth onClick={handleEnd}>
              Encerrar
            </Button>
          </>
        )}
        {canDelete && (
          <Button variant="destructive-ghost" leadingIcon={<Delete />} fullWidth onClick={() => setDeleteConfirmOpen(true)}>
            Deletar sessão
          </Button>
        )}
      </div>
      <BottomSheet
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Deletar sessão?"
        description="O tempo registrado será perdido e essa sessão não será salva."
        contentCard={false}
        primaryButton={
          <Button variant="destructive" fullWidth onClick={handleDeleteSession}>
            Deletar
          </Button>
        }
        secondaryButton={
          <Button variant="ghost" fullWidth onClick={() => setDeleteConfirmOpen(false)}>
            Cancelar
          </Button>
        }
      />
      {!isDesktop && (
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
      )}
    </>
  )

  if (isDesktop) {
    return (
      <div className="new-session-desktop-overlay">
        <div className="new-session-desktop-card">{body}</div>
      </div>
    )
  }

  return <main className="new-session">{body}</main>
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
function FinishSession({ draft, category, subcategory, languageId, autoOpenDuration, hideContentSection = false, onOpenLinkContent, onBack, onDiscard, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  // No sessionId exists yet at this point — content picked here is
  // only linked (via sessionContents) once Salvar actually creates
  // the session below, using whatever's collected in this list.
  const [pendingContents, setPendingContents] = useState([])

  function handleAddContent() {
    onOpenLinkContent((item) => {
      setPendingContents((current) => (current.some((c) => c.id === item.id) ? current : [...current, item]))
    })
  }

  function handleRemoveContent(id) {
    setPendingContents((current) => current.filter((c) => c.id !== id))
  }

  async function handleSave(fields) {
    if (!languageId || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      const session = await createSession({ languageId, ...fields })
      await Promise.all(pendingContents.map((content) => linkSessionContent(session.id, content.id)))
      onSaved(session)
    } catch (err) {
      console.error('Erro ao salvar sessão:', err)
      setSaveError('Não foi possível salvar a sessão. Tente novamente.')
      setSaving(false)
    }
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
      {saveError && <Alert description={saveError} />}
      <SessionForm
        initialStartAt={draft.startAt}
        initialDurationSeconds={draft.durationSeconds}
        initialCategory={category}
        initialSubcategory={subcategory}
        autoOpenDuration={autoOpenDuration}
        linkedContents={pendingContents}
        onAddContent={handleAddContent}
        onRemoveContent={handleRemoveContent}
        hideContentSection={hideContentSection}
        onSave={handleSave}
        saving={saving || !languageId}
        secondaryButton={
          <Button variant="destructive-ghost" leadingIcon={<Delete />} fullWidth onClick={() => setConfirmOpen(true)}>
            Descartar sessão
          </Button>
        }
      />
      <BottomSheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Descartar sessão?"
        description="O tempo registrado será perdido e essa sessão não será salva."
        contentCard={false}
        primaryButton={
          <Button variant="destructive" fullWidth onClick={onDiscard}>
            Descartar
          </Button>
        }
        secondaryButton={
          <Button variant="ghost" fullWidth onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
        }
      />
    </main>
  )
}

export default NewSession
