import { Pause, PlayArrow, Stop } from '@nine-thirty-five/material-symbols-react/outlined/filled'
import Button from './Button'
import './TimerWidget.css'

// Mobile floating timer card (Home's FAB slot while a draft exists).
// Always collapsed — no more in-place expand. Encerrar ends the draft
// and hands off to the finish/details screen (onFinish, same as the
// old "Encerrar"); tapping the label/time opens the full edit screen
// (category picker + Pausar/Retomar/Encerrar + Deletar — NewSession's
// "timer" phase), where the clock keeps ticking in the background;
// Pausar/Continuar toggles in place without leaving Home. Deletar no
// longer lives on this card — it's inside that edit screen only.
function TimerWidget({
  elapsedLabel,
  category = null,
  subcategory = null,
  running = false,
  onToggle,
  onFinish,
  onEdit,
}) {
  const hasCategory = Boolean(category)
  const label = hasCategory ? (subcategory ? `${category} · ${subcategory}` : category) : 'Sem categoria'

  return (
    <div className="timer-widget" data-running={running}>
      <button type="button" className="timer-widget-info" onClick={onEdit}>
        <span className="timer-widget-label">{label}</span>
        <span className="timer-widget-time">{elapsedLabel}</span>
      </button>
      <div className="timer-widget-actions">
        <Button size="sm" variant="destructive" leadingIcon={<Stop />} aria-label="Encerrar" onClick={onFinish} />
        <Button
          size="sm"
          variant="primary"
          leadingIcon={running ? <Pause /> : <PlayArrow />}
          aria-label={running ? 'Pausar' : 'Continuar'}
          onClick={onToggle}
        />
      </div>
    </div>
  )
}

export default TimerWidget
