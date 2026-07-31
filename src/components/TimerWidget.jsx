import { Stop } from '@nine-thirty-five/material-symbols-react/outlined/filled'
import Button from './Button'
import './TimerWidget.css'

// Mobile floating timer card (Home's FAB slot while a draft exists).
// Only one action lives on the card itself: Stop, which ends the draft
// and hands off straight to the finish/details screen (onFinish — same
// as the old "Encerrar"). Tapping the rest of the card (label/time)
// opens the full-screen timer instead (onEdit — NewSession's "timer"
// phase, with the category picker, Pausar/Retomar, Encerrar sessão,
// and Deletar), where the clock keeps ticking in the background.
function TimerWidget({
  elapsedLabel,
  category = null,
  subcategory = null,
  running = false,
  onFinish,
  onEdit,
}) {
  const hasCategory = Boolean(category)
  const label = hasCategory ? (subcategory ? `${category} · ${subcategory}` : category) : 'Sem categoria'

  return (
    <div className="timer-widget" data-running={running} data-has-category={hasCategory}>
      <button type="button" className="timer-widget-info" onClick={onEdit}>
        <span className="timer-widget-label">{label}</span>
        <span className="timer-widget-time">{elapsedLabel}</span>
      </button>
      <Button size="sm" variant="destructive" leadingIcon={<Stop />} aria-label="Encerrar" onClick={onFinish} />
    </div>
  )
}

export default TimerWidget
