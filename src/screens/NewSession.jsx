import { useEffect, useState } from 'react'
import TopNav from '../components/TopNav'
import Dropdown from '../components/Dropdown'
import Button from '../components/Button'
import BottomSheet from '../components/BottomSheet'
import SelectionChip from '../components/SelectionChip'
import { Close, PlayArrow, Pause, Stop } from '@nine-thirty-five/material-symbols-react/outlined'
import { CATEGORIES } from '../data/categories'
import './NewSession.css'

// Three states only: idle (not started) / running / paused. No IndexedDB
// writes happen here yet — per the locked MVP decision, the timer lives
// purely in memory, and closing/reloading loses it. So there's nothing
// to resume on mount either; this screen always starts idle.
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
// subcategory (SelectionChip, now that it exists). The sheet has its
// own pending* draft state so "Cancelar" can discard edits instead of
// applying each tap live — only "Salvar" commits to category/
// subcategory, which is what the Dropdown actually displays. Picking a
// category isn't required to start the timer (the data model allows
// picking it during or after the session), so the timer flow itself
// isn't blocked by leaving it unset.
//
// "Encerrar" doesn't lead to a real session-details screen yet (that
// screen needs more than Chip — duration editing, date picker, etc.,
// none of which exist). For now it just discards and closes — swap
// handleEnd's body for real navigation once that screen exists.
function NewSession({ onClose }) {
  const [status, setStatus] = useState('idle') // idle | running | paused
  const [accumulatedMs, setAccumulatedMs] = useState(0)
  const [runStartedAt, setRunStartedAt] = useState(null)
  const [now, setNow] = useState(() => Date.now())

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
    if (status !== 'running') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [status])

  function handleStart() {
    setRunStartedAt(Date.now())
    setStatus('running')
  }

  function handlePause() {
    setAccumulatedMs((ms) => ms + (Date.now() - runStartedAt))
    setRunStartedAt(null)
    setStatus('paused')
  }

  function handleResume() {
    setRunStartedAt(Date.now())
    setStatus('running')
  }

  function handleEnd() {
    // TODO: open the session-details screen once it exists, passing
    // along the elapsed duration. Blocked on Chip + the rest of that
    // screen's missing fields.
    onClose()
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

  const liveMs = status === 'running' ? accumulatedMs + (now - runStartedAt) : accumulatedMs
  const totalSeconds = Math.floor(liveMs / 1000)
  const display = [Math.floor(totalSeconds / 3600), Math.floor((totalSeconds % 3600) / 60), totalSeconds % 60]
    .map((unit) => String(unit).padStart(2, '0'))
    .join(':')

  const categoryData = CATEGORIES.find((item) => item.key === category)
  const subcategoryLabel = categoryData?.subcategories.find((item) => item.key === subcategory)?.label
  const pendingCategoryData = CATEGORIES.find((item) => item.key === pendingCategory)

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

export default NewSession
