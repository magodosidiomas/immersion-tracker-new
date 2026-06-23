import './SuggestionChip.css'

function SuggestionChip({
  label = 'Button label',
  leadingIcon,
  trailingIcon,
  pressed = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      type="button"
      className="suggestion-chip"
      data-pressed={pressed}
      disabled={disabled}
      aria-pressed={pressed}
      {...props}
    >
      {leadingIcon && <span className="suggestion-chip-icon">{leadingIcon}</span>}
      <span className="suggestion-chip-label">{label}</span>
      {trailingIcon && <span className="suggestion-chip-icon">{trailingIcon}</span>}
    </button>
  )
}

export default SuggestionChip
