import './SuggestionChip.css'
import { Check } from '@nine-thirty-five/material-symbols-react/outlined'

function SuggestionChip({
  label = 'Button label',
  leadingIcon,
  trailingIcon,
  disabled = false,
  ...props
}) {
  return (
    <button
      type="button"
      className="suggestion-chip"
      disabled={disabled}
      {...props}
    >
      {leadingIcon && <span className="suggestion-chip-icon">{leadingIcon}</span>}
      <span className="suggestion-chip-label">{label}</span>
      {trailingIcon && <span className="suggestion-chip-icon">{trailingIcon}</span>}
    </button>
  )
}

export default SuggestionChip
