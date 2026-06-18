import './SelectionChip.css'
import { Check } from '@nine-thirty-five/material-symbols-react/outlined'

// Mirrors the Figma "selectionChip" component set. type=dated is the
// only type in the set, so it's not exposed as a prop — same idea as
// Button not exposing a "state" prop for things the set never varies.
// hasLeadingIcon/hasTrailingIcon both default true since that's what
// both documented Figma instances (default + selected) actually show.
function SelectionChip({
  label = 'Button label',
  selected = false,
  hasLeadingIcon = true,
  hasTrailingIcon = true,
  ...props
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      className="selection-chip"
      data-selected={selected}
      {...props}
    >
      {hasLeadingIcon && (
        <span className="selection-chip-icon">
          <Check />
        </span>
      )}
      <span className="selection-chip-label">{label}</span>
      {hasTrailingIcon && (
        <span className="selection-chip-icon">
          <Check />
        </span>
      )}
    </button>
  )
}

export default SelectionChip
