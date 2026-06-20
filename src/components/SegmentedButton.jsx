import './SegmentedButton.css'

// Mirrors the Figma "segmentedButton" component set. isSelected maps to
// `selected`, same as SelectionChip. state (enabled/hover) isn't a prop —
// same reasoning as Button: the browser already does :hover for free.
function SegmentedButton({ label = 'Label', selected = false, ...props }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className="segmented-button"
      data-selected={selected}
      {...props}
    >
      <span className="segmented-button-label">{label}</span>
    </button>
  )
}

export default SegmentedButton
