import { Pause, PlayArrow, Stop } from '@nine-thirty-five/material-symbols-react/outlined'
import Button from './Button'
import './TimerWidget.css'

// Mirrors the Figma "timerCard" component set (hasSelection × state).
// Doubles as both the in-place card on Home and the floating mini-player
// shown over other screens while a timer is running or paused — same
// component, just rendered in different containers, no separate banner
// needed for "resume": the paused state of this widget IS the resume UI.
// Tapping the card opens the full timer screen (where discard also
// lives); the play/pause and Encerrar controls stop propagation so they
// don't also trigger that navigation.
//
// device="desktop" additionally renders labeled Encerrar/Pausar-Continuar
// buttons (Figma "Frame 93") instead of the icon-only toggle used on
// mobile. Encerrar calls onEnd (the real timer.end(), same as the
// full-screen flow's "Encerrar") rather than onClick, so it actually
// ends the session instead of just opening the timer screen.
function TimerWidget({
  elapsedLabel,
  category = null,
  subcategory = null,
  running = false,
  onToggle,
  onClick,
  onEnd,
  device = 'mobile',
}) {
  const label = category ? (subcategory ? `${category} · ${subcategory}` : category) : 'Sem categoria'

  return (
    <div className="timer-widget" data-running={running} data-device={device} onClick={onClick}>
      <div className="timer-widget-row">
        <div className="timer-widget-text">
          <p className="timer-widget-label">{label}</p>
          <div className="timer-widget-time">
            <span className="timer-widget-dot" />
            <span className="timer-widget-time-value">{elapsedLabel}</span>
          </div>
        </div>
        {device === 'desktop' ? (
          <div className="timer-widget-actions">
            <Button
              variant="outline"
              leadingIcon={<Stop />}
              onClick={(event) => {
                event.stopPropagation()
                onEnd?.()
              }}
            >
              Encerrar
            </Button>
            <Button
              variant={running ? 'warning' : 'primary'}
              leadingIcon={running ? <Pause /> : <PlayArrow />}
              onClick={(event) => {
                event.stopPropagation()
                onToggle?.()
              }}
            >
              {running ? 'Pausar' : 'Continuar'}
            </Button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}

export default TimerWidget
