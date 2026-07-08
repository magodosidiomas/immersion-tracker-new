import './Checkbox.css'
import { Check } from '@nine-thirty-five/material-symbols-react/outlined'

// The bare 16x16 box from Checkbox's markup, reused (its CSS class,
// via Checkbox.css) wherever a row needs to show selection state
// without being its own interactive control — e.g. ListItem/
// MediaListItem in selection mode, where the row itself is already
// the tap target and a nested <button role="checkbox"> would be
// invalid HTML and redundant.
function CheckboxIndicator({ checked = false }) {
  return (
    <span className="checkbox-box" data-checked={checked}>
      {checked && <Check />}
    </span>
  )
}

export default CheckboxIndicator
