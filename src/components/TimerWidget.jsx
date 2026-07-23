import { useState } from 'react'
import { Pause, PlayArrow, Save, Delete } from '@nine-thirty-five/material-symbols-react/outlined'
import Button from './Button'
import './TimerWidget.css'

// Mirrors the Figma "timerWidget" component set (hasSelection × state ×
// isExpanded). Same component for Home's in-flow card and the desktop
// floating mini-player — collapsed by default (pill), expands in place
// on tap to reveal Pausar/Continuar, Finalizar (ends + opens the
// finish/details screen, same as the old "Encerrar") and a discard
// icon (clears the draft entirely, no session saved). Buttons and the
// discard icon stop propagation so they don't also toggle expand/collapse.
function TimerWidget({
  elapsedLabel,
  category = null,
  subcategory = null,
  running = false,
  onToggle,
  onFinish,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(false)
  const hasCategory = Boolean(category)
  const label = hasCategory ? (subcategory ? `${category} · ${subcategory}` : category) : 'Sem categoria'

  return (
    <div
      className="timer-widget"
      data-running={running}
      data-expanded={expanded}
      data-has-category={hasCategory}
      onClick={() => setExpanded((value) => !value)}
    >
      <div className="timer-widget-row">
        <div className="timer-widget-cat">
          <span className="timer-widget-dot" />
          <span className="timer-widget-label">{label}</span>
        </div>
        {expanded ? (
          <button
            type="button"
            className="timer-widget-delete"
            aria-label="Descartar sessão"
            onClick={(event) => {
              event.stopPropagation()
              onDelete?.()
            }}
          >
            <Delete />
          </button>
        ) : (
          <span className="timer-widget-time">{elapsedLabel}</span>
        )}
      </div>
      {expanded && (
        <>
          <span className="timer-widget-time-expanded">{elapsedLabel}</span>
          <div className="timer-widget-actions">
            <Button
              variant="primary"
              leadingIcon={running ? <Pause /> : <PlayArrow />}
              onClick={(event) => {
                event.stopPropagation()
                onToggle?.()
              }}
            >
              {running ? 'Pausar' : 'Continuar'}
            </Button>
            <Button
              variant="outline"
              leadingIcon={<Save />}
              onClick={(event) => {
                event.stopPropagation()
                onFinish?.()
              }}
            >
              Finalizar
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default TimerWidget
