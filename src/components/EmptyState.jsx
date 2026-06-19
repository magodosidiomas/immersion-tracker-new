import Button from './Button'
import './EmptyState.css'

// Generic "nothing here yet" body state — icon in a circle outline,
// bold title, muted description, optional CTA button. Matches the
// Figma "emptyState" component exactly (single component, no variants).
// First use: Home when the active language has no sessions yet. Built
// generic (icon/copy/button all passed in) so other empty lists can
// reuse it later without a new component.
function EmptyState({ icon, title, description, buttonLabel, buttonIcon, onButtonClick }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">{icon}</span>
      <div className="empty-state-text">
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-description">{description}</p>
      </div>
      {buttonLabel && (
        <Button variant="outline" leadingIcon={buttonIcon} onClick={onButtonClick}>
          {buttonLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
