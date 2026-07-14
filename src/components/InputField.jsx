import { useId, forwardRef } from 'react'
import './InputField.css'

// Mirrors the Figma "inputField" component set. isFilled isn't a prop —
// the browser already knows whether the field is empty, so the value
// style vs. placeholder style is just the input's own ::placeholder
// rule instead of a manual swap (same reasoning as Button skipping a
// "state" prop for hover). input-text isn't a custom prop either:
// this renders a real <input>, so value/onChange/defaultValue work the
// normal React way via ...props. hasLabel/hasHintText/hasLeadingIcon/
// hasTrailingIcon aren't separate props — passing null already hides
// each one, same simplification as Button/Dropdown.
//
// The label text is tied to the input via explicit htmlFor/id, not by
// wrapping the input in a <label> — Chrome fires a synthetic extra
// click on a label-wrapped input to forward focus, and on segmented
// inputs (type="time"/"date") that double click reads as a click-drag,
// highlighting the segment like a text selection.
const InputField = forwardRef(function InputField({
  label = null,
  placeholder = '',
  hint = null,
  error = null,
  leadingIcon = null,
  trailingIcon = null,
  onTrailingIconClick,
  className,
  ...props
}, ref) {
  const id = useId()
  return (
    <div className={className ? `input-field ${className}` : 'input-field'}>
      {label && (
        <label className="input-field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <span className="input-field-body">
        <span className="input-field-control" data-error={Boolean(error)}>
          {leadingIcon && <span className="input-field-icon">{leadingIcon}</span>}
          <input ref={ref} id={id} className="input-field-input" type="text" placeholder={placeholder} {...props} />
          {trailingIcon &&
            (onTrailingIconClick ? (
              <button type="button" className="input-field-icon input-field-icon-button" onClick={onTrailingIconClick}>
                {trailingIcon}
              </button>
            ) : (
              <span className="input-field-icon">{trailingIcon}</span>
            ))}
        </span>
        {error ? <span className="input-field-error">{error}</span> : hint && <span className="input-field-hint">{hint}</span>}
      </span>
    </div>
  )
})

export default InputField
