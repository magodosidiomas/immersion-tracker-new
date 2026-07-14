import Button from './Button'
import './EmptyState.css'

// Generic "nothing here yet" body state — icon in a circle outline,
// bold title, muted description, optional CTA button. Matches the
// Figma "emptyState" component. Two variants: "background" (default,
// filled with bg-surface-default) and "outline" (subtle border, no
// fill). First use: Home when the active language has no sessions
// yet. Built generic (icon/copy/button all passed in) so other empty
// lists can reuse it later without a new component.
function EmptyState({ icon, title, description, buttonLabel, buttonIcon, onButtonClick, style = 'background', buttonVariant = 'outline' }) {
  return (
    <div className="empty-state" data-style={style}>
      <span className="empty-state-icon">{icon}</span>
      <div className="empty-state-text">
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-description">{description}</p>
      </div>
      {buttonLabel && (
        <Button variant={buttonVariant} leadingIcon={buttonIcon} onClick={onButtonClick}>
          {buttonLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
