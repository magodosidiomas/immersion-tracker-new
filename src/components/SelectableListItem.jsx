import './SelectableListItem.css'

// A generic, clickable list row for "pick one from a list" UIs — the
// language switcher today, category/subcategory pickers later. It only
// owns the row chrome (selected tint, disabled state, optional divider);
// flag/leading/trailing are plain slots so it stays decoration-agnostic
// instead of hardcoding flag rendering or a specific icon set. `flag` is
// expected to be a plain emoji character (Language.flagEmoji from the
// data model), not an icon component — it's styled differently (see CSS)
// since it has no intrinsic size to stretch the way an SVG icon does.
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
function SelectableListItem({
  label = 'Label',
  selected = false,
  disabled = false,
  divider = false,
  flag = null,
  leadingIcon = null,
  trailingIcon = null,
  ...props
}) {
  return (
    <button
      type="button"
      className="selectable-list-item"
      data-selected={selected}
      data-divider={divider}
      disabled={disabled}
      {...props}
    >
      <span className="selectable-list-item-row">
        {leadingIcon && <span className="selectable-list-item-icon">{leadingIcon}</span>}
        {flag && <span className="selectable-list-item-flag">{flag}</span>}
        {label && <span className="selectable-list-item-label">{label}</span>}
        {trailingIcon && <span className="selectable-list-item-icon">{trailingIcon}</span>}
      </span>
      {divider && <span className="selectable-list-item-divider" />}
    </button>
  )
}

export default SelectableListItem
