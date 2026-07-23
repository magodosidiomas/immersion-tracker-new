import './SelectableListItem.css'

// A generic, clickable list row for "pick one from a list" UIs — the
// language switcher today, category/subcategory pickers later. It only
// owns the row chrome (selected tint, disabled state, optional divider);
// flag/leading/trailing are plain slots so it stays decoration-agnostic
// instead of hardcoding flag rendering or a specific icon set. `flag`
// is expected to be a <Flag> element (see components/Flag.jsx), not a
// Material icon — it's styled differently (see CSS) since it has a
// fixed aspect ratio rather than filling a square box.
//
// The Figma export for this component generates a much more elaborate
// variant matrix, but most of those combinations (e.g. disabled + divider
// + selected) were never actually drawn in the file — they're just an
// artifact of every boolean prop being multiplied together. The rules
// below only encode the states that were actually designed:
//   - disabled always wins for color, regardless of selected/divider
//   - selected (when not disabled) tints the label only, never the icons
//   - the highlighted background appears on a selected row, but not when
//     that row also has a divider (no example combines the two)
// Hover isn't a designed state either, but — like Button — it's added
// for free via :hover instead of a manual "state" prop.
//
// `density` ('default' | 'compact') is opt-in and only reduces the row's
// own vertical padding — used for long flush lists (e.g. AddLanguages)
// where the default row height leaves too much space between dividers.
//
// `position` ('first' | 'middle' | 'last' | 'only') is opt-in and only
// matters for lists rendered flush inside a card (no card padding, no
// button inset padding): it zeroes the button's own padding and caps
// the hover/selected pill's radius to the card's corners instead of
// the item's own smaller radius, so the pill never pokes past the
// card's rounded edge on the first/last row. Leave it unset for the
// existing inset usage (card keeps its own padding) — nothing changes.
function SelectableListItem({
  label = 'Label',
  description = null,
  selected = false,
  disabled = false,
  divider = false,
  flag = null,
  leadingIcon = null,
  trailingIcon = null,
  position,
  density = 'default',
  ...props
}) {
  return (
    <button
      type="button"
      className="selectable-list-item"
      data-selected={selected}
      data-divider={divider}
      data-position={position}
      data-density={density}
      disabled={disabled}
      {...props}
    >
      {divider && <span className="selectable-list-item-divider" />}
      <span className="selectable-list-item-row">
        {leadingIcon && <span className="selectable-list-item-icon">{leadingIcon}</span>}
        {flag && <span className="selectable-list-item-flag">{flag}</span>}
        {label && (
          <span className="selectable-list-item-text">
            <span className="selectable-list-item-label">{label}</span>
            {description && <span className="selectable-list-item-description">{description}</span>}
          </span>
        )}
        {trailingIcon && <span className="selectable-list-item-icon">{trailingIcon}</span>}
      </span>
    </button>
  )
}

export default SelectableListItem
