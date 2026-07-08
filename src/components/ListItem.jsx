import './ListItem.css'
import CheckboxIndicator from './CheckboxIndicator'

// A generic, clickable list row for showing log-style entries — e.g. a
// session row reading "Imersão · Escuta e leitura, 1h 20". Unlike
// SelectableListItem, this one has no selected state at all: it's
// interactive (onClick still fires) but never reflects a "currently
// chosen" row, so there's nothing to design for that. It adds two slots
// SelectableListItem doesn't need — `description` (secondary line under
// the label) and `extraText` (the bold value, e.g. a duration, sitting
// before trailingIcon) — but everything else (flag/leadingIcon/
// trailingIcon as plain slots, hover instead of a separate state,
// disabled/divider rules) mirrors SelectableListItem on purpose, since
// this is the same row chrome carrying more content.
function ListItem({
  label = 'Label',
  description = null,
  extraText = null,
  disabled = false,
  divider = false,
  flag = null,
  leadingIcon = null,
  trailingIcon = null,
  selectionMode = false,
  selected = false,
  ...props
}) {
  // In selection mode the row toggles a checkbox rather than acting as
  // its own control, so it renders as a <div> (props.onClick/onPointerX
  // still fire the same way) — mirrors MediaListItem's div-vs-button
  // split for the same "avoid a nested interactive element" reason.
  const Tag = selectionMode ? 'div' : 'button'
  return (
    <Tag
      type={selectionMode ? undefined : 'button'}
      className="list-item"
      data-divider={divider}
      disabled={selectionMode ? undefined : disabled}
      {...props}
    >
      <span className="list-item-row">
        {selectionMode ? (
          <CheckboxIndicator checked={selected} />
        ) : (
          <>
            {leadingIcon && <span className="list-item-icon">{leadingIcon}</span>}
            {flag && <span className="list-item-flag">{flag}</span>}
          </>
        )}
        <span className="list-item-text">
          {label && <span className="list-item-label">{label}</span>}
          {description && <span className="list-item-description">{description}</span>}
        </span>
        {extraText && <span className="list-item-extra">{extraText}</span>}
        {trailingIcon && <span className="list-item-icon">{trailingIcon}</span>}
      </span>
      {divider && <span className="list-item-divider" />}
    </Tag>
  )
}

export default ListItem
