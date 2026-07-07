import './MediaListItem.css'

// Content row for the Biblioteca and content-picker sheets — a
// Thumbnail (image or icon fallback) plus title/subtitle. Mirrors
// ListItem's chrome (hover, divider, disabled) exactly, since it's the
// same row shell carrying a bigger leading slot instead of a small icon.
//
// trailingAction (icon + onClick, e.g. "remove_circle_outline" in
// SessionForm's Conteúdos vinculados list) turns the row itself
// non-interactive — only that action is clickable — since nesting a
// real button inside the row's own <button> isn't valid HTML. Rows
// that don't need per-item actions (Biblioteca, content picker) keep
// the whole row as one clickable button via onClick, same as before.
function MediaListItem({
  thumbnail = null,
  title = 'Content title',
  subtitle = null,
  disabled = false,
  divider = false,
  trailingAction = null,
  ...props
}) {
  const content = (
    <span className="media-list-item-row">
      {thumbnail}
      <span className="media-list-item-text">
        <span className="media-list-item-title">{title}</span>
        {subtitle && <span className="media-list-item-subtitle">{subtitle}</span>}
      </span>
      {trailingAction && (
        <button
          type="button"
          className="media-list-item-action"
          onClick={trailingAction.onClick}
          aria-label={trailingAction.label ?? 'Remover'}
        >
          {trailingAction.icon}
        </button>
      )}
    </span>
  )

  if (trailingAction) {
    return (
      <div className="media-list-item" data-divider={divider}>
        {content}
        {divider && <span className="media-list-item-divider" />}
      </div>
    )
  }

  return (
    <button type="button" className="media-list-item" data-divider={divider} disabled={disabled} {...props}>
      {content}
      {divider && <span className="media-list-item-divider" />}
    </button>
  )
}

export default MediaListItem
