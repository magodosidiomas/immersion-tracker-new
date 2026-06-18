import './Checkbox.css'
import { Check } from '@nine-thirty-five/material-symbols-react/outlined'

// Mirrors the Figma "checkbox" component set. checkboxBase (the 16x16
// box + check icon) is folded in as a plain element rather than its
// own component — same simplification Button/Dropdown/SelectableListItem
// use for their sub-parts. hasLabel/hasDescription aren't separate
// props either: passing null for label/description already hides them.
//
// Built as a <button role="checkbox"> rather than a native
// <input type="checkbox">, matching how Button/Dropdown/SelectableListItem
// are all buttons rather than native form elements elsewhere in this app.
function Checkbox({ checked = false, label = 'Label', description = null, ...props }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className="checkbox"
      data-checked={checked}
      {...props}
    >
      <span className="checkbox-row">
        <span className="checkbox-box">{checked && <Check />}</span>
        {label && <span className="checkbox-label">{label}</span>}
      </span>
      {description && <span className="checkbox-description">{description}</span>}
    </button>
  )
}

export default Checkbox
