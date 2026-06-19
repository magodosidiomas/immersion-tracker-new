import { Pause, PlayArrow } from '@nine-thirty-five/material-symbols-react/outlined'
import './TimerWidget.css'

// Mirrors the Figma "timerCard" component set (hasSelection × state).
// Doubles as both the in-place card on Home and the floating mini-player
// shown over other screens while a timer is running or paused — same
// component, just rendered in different containers, no separate banner
// needed for "resume": the paused state of this widget IS the resume UI.
// Tapping the card opens the full timer screen (where discard also
// lives); the play/pause button stops propagation so it doesn't also
// trigger that navigation.
function TimerWidget({
  elapsedLabel,
  category = null,
  subcategory = null,
  running = false,
  onToggle,
  onClick,
}) {
  const label = category ? (subcategory ? `${category} · ${subcategory}` : category) : 'Sem categoria'

  return (
    <div className="timer-widget" onClick={onClick}>
      <div className="timer-widget-row">
        <div className="timer-widget-text">
          <p className="timer-widget-label">{label}</p>
          <div className="timer-widget-time">
            <span className="timer-widget-dot" />
            <span className="timer-widget-time-value">{elapsedLabel}</span>
          </div>
        </div>
        <button
          type="button"
          className="timer-widget-toggle"
          aria-label={running ? 'Pausar sessão' : 'Continuar sessão'}
          onClick={(event) => {
            event.stopPropagation()
            onToggle?.()
          }}
        >
          {running ? <Pause /> : <PlayArrow />}
        </button>
      </div>
    </div>
  )
}

export default TimerWidget
