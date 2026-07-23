import './RadioButton.css'
import { RadioButtonChecked, RadioButtonUnchecked } from '@nine-thirty-five/material-symbols-react/outlined'

// The bare 24x24 icon from RadioButton's markup, reused (its CSS class,
// via RadioButton.css) wherever a row needs to show single-select state
// without being its own interactive control — e.g. a row that is
// already the tap target, where a nested <button role="radio"> would
// be invalid HTML and redundant. Same pattern as CheckboxIndicator.
function RadioButtonIndicator({ checked = false }) {
  return (
    <span className="radio-button-icon" data-checked={checked}>
      {checked ? <RadioButtonChecked /> : <RadioButtonUnchecked />}
    </span>
  )
}

export default RadioButtonIndicator
