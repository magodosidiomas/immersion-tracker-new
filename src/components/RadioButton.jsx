import './RadioButton.css'
import { RadioButtonChecked, RadioButtonUnchecked } from '@nine-thirty-five/material-symbols-react/outlined'

// Mirrors the Figma "radioButton" component set. Built as a
// <button role="radio"> rather than a native <input type="radio">,
// same reasoning as Checkbox/Dropdown/SelectableListItem elsewhere
// in this app. label is optional (null hides it), matching Checkbox.
function RadioButton({ checked = false, label = 'Label', disabled = false, ...props }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      className="radio-button"
      data-checked={checked}
      {...props}
    >
      <span className="radio-button-icon" data-checked={checked}>
        {checked ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
      </span>
      {label && <span className="radio-button-label">{label}</span>}
    </button>
  )
}

export default RadioButton
