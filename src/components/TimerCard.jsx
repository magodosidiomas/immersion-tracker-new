import { useEffect, useRef, useState } from 'react'
import { PlayArrow, Pause, Stop, Edit } from '@nine-thirty-five/material-symbols-react/outlined'
import SelectionChip from './SelectionChip'
import { CATEGORIES } from '../data/categories'
import { getCategoryLabel } from '../utils/sessions'
import './TimerCard.css'

// Desktop-only replacement for the old floating "app-timer-corner"
// widget. One component, two contexts:
// - variant="home": always mounted in Home's content flow, shows the
//   idle state (category picker + manual-entry pencil + play) when
//   there's no draft.
// - variant="banner": mounted above every other screen's content,
//   only rendered by the caller while a draft exists (running or
//   paused) — this component itself never renders an idle banner.
// Category/subcategory selection is a single chip-based dropdown
// (approved over two separate menus and over a two-column/tab
// layout) — one trigger, one panel, "Categoria" and "Subcategoria"
// as two chip rows with their own small group label.
function TimerCard({
  variant = 'home',
  status = 'idle', // idle | running | paused
  category = null,
  subcategory = null,
  elapsedLabel = '00:00',
  onSelectCategory,
  onStart,
  onManualEntry,
  onPause,
  onResume,
  onStop,
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef(null)

  useEffect(() => {
    if (!pickerOpen) return
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [pickerOpen])

  if (variant === 'banner' && status === 'idle') return null

  const activeCategory = CATEGORIES.find((item) => item.key === category) ?? CATEGORIES[0]
  const { categoryLabel, subcategoryLabel } = getCategoryLabel(category, subcategory)
  const hasSelection = Boolean(category)
  const running = status === 'running'

  function handlePickCategory(cat) {
    onSelectCategory?.(cat.key, cat.subcategories[0].key)
  }

  function handlePickSubcategory(sub) {
    onSelectCategory?.(activeCategory.key, sub.key)
    setPickerOpen(false)
  }

  return (
    <div className="timer-card" data-status={status} data-variant={variant}>
      <div className="timer-card-left" ref={pickerRef}>
        <span className="timer-card-dot" data-active={running} />
        <button
          type="button"
          className="timer-card-trigger"
          data-idle={!hasSelection}
          onClick={() => setPickerOpen((value) => !value)}
        >
          {hasSelection ? (
            <>
              {categoryLabel}
              {subcategoryLabel && <span className="timer-card-sep">•</span>}
              {subcategoryLabel}
            </>
          ) : (
            'Selecionar categoria'
          )}
        </button>

        {pickerOpen && (
          <div className="timer-card-picker">
            <p className="timer-card-picker-label">Categoria</p>
            <div className="timer-card-chip-row">
              {CATEGORIES.map((cat) => (
                <SelectionChip
                  key={cat.key}
                  label={cat.label}
                  selected={cat.key === activeCategory.key}
                  hasLeadingIcon={false}
                  hasTrailingIcon={false}
                  onClick={() => handlePickCategory(cat)}
                />
              ))}
            </div>
            <p className="timer-card-picker-label timer-card-picker-label--sub">Subcategoria</p>
            <div className="timer-card-chip-row">
              {activeCategory.subcategories.map((sub) => (
                <SelectionChip
                  key={sub.key}
                  label={sub.label}
                  selected={hasSelection && sub.key === subcategory}
                  hasLeadingIcon={false}
                  hasTrailingIcon={false}
                  onClick={() => handlePickSubcategory(sub)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="timer-card-right">
        <span className="timer-card-time" data-idle={status === 'idle'}>{elapsedLabel}</span>
        <div className="timer-card-actions">
          {status === 'idle' && (
            <>
              <button type="button" className="timer-card-btn" data-style="outline" aria-label="Registro manual" onClick={onManualEntry}>
                <Edit />
              </button>
              <button type="button" className="timer-card-btn" data-style="solid" aria-label="Iniciar" onClick={onStart}>
                <PlayArrow />
              </button>
            </>
          )}
          {status === 'running' && (
            <>
              <button type="button" className="timer-card-btn" data-style="outline" aria-label="Pausar" onClick={onPause}>
                <Pause />
              </button>
              <button type="button" className="timer-card-btn" data-style="destructive" aria-label="Parar e salvar" onClick={onStop}>
                <Stop />
              </button>
            </>
          )}
          {status === 'paused' && (
            <>
              <button type="button" className="timer-card-btn" data-style="solid" aria-label="Retomar" onClick={onResume}>
                <PlayArrow />
              </button>
              <button type="button" className="timer-card-btn" data-style="destructive" aria-label="Parar e salvar" onClick={onStop}>
                <Stop />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TimerCard
