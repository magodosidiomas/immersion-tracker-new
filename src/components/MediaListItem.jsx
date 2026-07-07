import './MediaListItem.css'

// Content row for the Biblioteca and content-picker sheets — a
// Thumbnail (image or icon fallback) plus title/subtitle. Mirrors
// ListItem's chrome (hover, divider, disabled) exactly, since it's the
// same row shell carrying a bigger leading slot instead of a small icon.
function MediaListItem({ thumbnail = null, title = 'Content title', subtitle = null, disabled = false, divider = false, ...props }) {
  return (
    <button
      type="button"
      className="media-list-item"
      data-divider={divider}
      disabled={disabled}
      {...props}
    >
      <span className="media-list-item-row">
        {thumbnail}
        <span className="media-list-item-text">
          <span className="media-list-item-title">{title}</span>
          {subtitle && <span className="media-list-item-subtitle">{subtitle}</span>}
        </span>
      </span>
      {divider && <span className="media-list-item-divider" />}
    </button>
  )
}

export default MediaListItem
