import Button from './Button'
import './Coachmark.css'

// Small onboarding tooltip anchored to a UI element via a relatively
// positioned wrapper around it. Purely presentational — step sequencing,
// the "seen" flag, and dismissal logic live in the parent screen.
function Coachmark({ title, body, step, totalSteps, onNext, onSkip, nextLabel = 'Próximo', align = 'left' }) {
  return (
    <div className="coachmark" data-align={align}>
      <div className="coachmark-arrow" />
      <p className="coachmark-title">{title}</p>
      <p className="coachmark-body">{body}</p>
      <div className="coachmark-footer">
        <div className="coachmark-dots">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span key={i} className="coachmark-dot" data-active={i === step - 1} />
          ))}
        </div>
        <div className="coachmark-actions">
          <Button variant="ghost" size="sm" onClick={onSkip}>Pular</Button>
          <Button variant="primary" size="sm" onClick={onNext}>{nextLabel}</Button>
        </div>
      </div>
    </div>
  )
}

export default Coachmark
