import { useEffect, useRef, useState } from 'react'
import { PlayArrow, Pause, Stop } from '@nine-thirty-five/material-symbols-react/outlined/filled'
import { KeyboardArrowDown } from '@nine-thirty-five/material-symbols-react/outlined'
import Button from './Button'
import SelectionChip from './SelectionChip'
import Coachmark from './Coachmark'
import { CATEGORIES } from '../data/categories'
import { getCategoryLabel } from '../utils/sessions'
import './TimerCard.css'

// Desktop-only replacement for the old floating "app-timer-corner"
// widget. One component, two contexts:
// - variant="home": always mounted in Home's content flow, shows the
//   idle state (category picker + play) when there's no draft.
//   Registro manual lives back in Home's own TopNavDesktop, not here.
// - variant="banner": mounted below every other screen's own header,
//   only rendered by the caller while a draft exists (running or
//   paused) — this component itself never renders an idle banner.
// Category/subcategory selection is a single chip-based dropdown
// (approved over two separate menus and over a two-column/tab
// layout) — one trigger, one panel, "Categoria" and "Subcategoria"
// as two chip rows with their own small group label. There's no
// separate "clear" action: clicking the already-selected category
// chip again toggles it off (and its subcategory with it).
function TimerCard({
  variant = 'home',
  status = 'idle', // idle | running | paused
  category = null,
  subcategory = null,
  elapsedLabel = '00:00',
  onSelectCategory,
  onStart,
  onPause,
  onResume,
  onStop,
  coachmarkStep = 0, // 0 = hidden, 1 = category, 2 = play
  onCoachmarkNext,
  onCoachmarkSkip,
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

  function handlePickCategory(cat) {
    if (hasSelection && cat.key === activeCategory.key) {
      onSelectCategory?.(null, null)
      return
    }
    onSelectCategory?.(cat.key, cat.subcategories[0].key)
  }

  function handlePickSubcategory(sub) {
    onSelectCategory?.(activeCategory.key, sub.key)
    setPickerOpen(false)
  }

  return (
    <div className="timer-card" data-status={status} data-variant={variant}>
      <div className="timer-card-left" ref={pickerRef}>
        <button
          type="button"
          className="timer-card-trigger"
          data-idle={!hasSelection}
          data-open={pickerOpen}
          onClick={() => setPickerOpen((value) => !value)}
        >
          {hasSelection ? (
            <>
              <span className="timer-card-category">{categoryLabel}</span>
              {subcategoryLabel && (
                <>
                  <span className="timer-card-sep">•</span>
                  <span className="timer-card-subcategory">{subcategoryLabel}</span>
                </>
              )}
            </>
          ) : (
            <span>Selecionar categoria</span>
          )}
          <KeyboardArrowDown className="timer-card-trigger-chevron" />
        </button>

        {coachmarkStep === 1 && (
          <Coachmark
            title="Escolha a categoria"
            body="Selecione o que você vai fazer"
            step={1}
            totalSteps={2}
            align="left"
            onNext={onCoachmarkNext}
            onSkip={onCoachmarkSkip}
          />
        )}

        {pickerOpen && (
          <div className="timer-card-picker">
            <p className="timer-card-picker-label">Categoria</p>
            <div className="timer-card-chip-row">
              {CATEGORIES.map((cat) => (
                <SelectionChip
                  key={cat.key}
                  label={cat.label}
                  selected={hasSelection && cat.key === activeCategory.key}
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
            <span className="timer-card-play-anchor">
              <Button size="sm" leadingIcon={<PlayArrow />} aria-label="Iniciar" onClick={onStart} />
              {coachmarkStep === 2 && (
                <Coachmark
                  title="Aperte o play pra começar"
                  body="Começa a marcar o tempo da sessão."
                  step={2}
                  totalSteps={2}
                  align="right"
                  nextLabel="Entendi"
                  onNext={onCoachmarkNext}
                  onSkip={onCoachmarkSkip}
                />
              )}
            </span>
          )}
          {status === 'running' && (
            <>
              <Button size="sm" variant="destructive" leadingIcon={<Stop />} onClick={onStop}>
                Encerrar
              </Button>
              <Button size="sm" variant="outline" leadingIcon={<Pause />} aria-label="Pausar" onClick={onPause} />
            </>
          )}
          {status === 'paused' && (
            <>
              <Button size="sm" variant="destructive" leadingIcon={<Stop />} onClick={onStop}>
                Encerrar
              </Button>
              <Button size="sm" leadingIcon={<PlayArrow />} aria-label="Continuar" onClick={onResume} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TimerCard
