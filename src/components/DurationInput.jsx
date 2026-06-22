import { forwardRef, useImperativeHandle, useRef } from 'react'
import { Error as ErrorIcon } from '@nine-thirty-five/material-symbols-react/outlined'
import { pad2 } from '../utils/date'
import './DurationInput.css'

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

// A row of 2 or 3 numeric segment inputs (h:m or h:m:s) with labels
// below each field and an optional error message below the row.
//
// Uncontrolled internally — seeded once from `initialValue` at mount.
// Parent reads the current value via ref.getValue(); auto-advances
// focus on two-digit entry and on Enter, same as the existing
// duration edit in SessionForm (from which this was extracted).
//
// Usage:
//   const ref = useRef()
//   <DurationInput ref={ref} initialValue={{ hours: 1, minutes: 30, seconds: 0 }} hasSeconds />
//   ref.current.getValue()   → { hours, minutes, seconds }
//   ref.current.focusFirst() → focuses the hours field
const DurationInput = forwardRef(function DurationInput(
  { hasSeconds = false, initialValue = { hours: 0, minutes: 0, seconds: 0 }, errorMessage = null },
  ref,
) {
  const hourRef = useRef(null)
  const minuteRef = useRef(null)
  const secondRef = useRef(null)

  useImperativeHandle(ref, () => ({
    getValue() {
      const h = clamp(parseInt(hourRef.current?.value || '0', 10), 0, 23)
      const m = clamp(parseInt(minuteRef.current?.value || '0', 10), 0, 59)
      const s = hasSeconds ? clamp(parseInt(secondRef.current?.value || '0', 10), 0, 59) : 0
      return { hours: h, minutes: m, seconds: s }
    },
    focusFirst() {
      hourRef.current?.focus()
    },
  }))

  function handleBlur(inputRef, max) {
    const value = clamp(parseInt(inputRef.current.value || '0', 10), 0, max)
    inputRef.current.value = pad2(value)
  }

  function handleFocus(event) {
    event.target.value = ''
  }

  function handleInput(event, nextRef) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '').slice(0, 2)
    if (event.target.value.length === 2 && nextRef) nextRef.current?.focus()
  }

  function handleKeyDown(event, nextRef) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (nextRef) nextRef.current?.focus()
    else event.target.blur()
  }

  const hasError = Boolean(errorMessage)

  return (
    <div className="duration-input">
      <div className="duration-input-fields">
        <div className="duration-input-segment-group">
          <input
            ref={hourRef}
            defaultValue={pad2(initialValue.hours)}
            maxLength={2}
            inputMode="numeric"
            aria-label="Horas"
            data-error={hasError || undefined}
            className="duration-input-segment"
            onBlur={() => handleBlur(hourRef, 23)}
            onFocus={handleFocus}
            onInput={(e) => handleInput(e, minuteRef)}
            onKeyDown={(e) => handleKeyDown(e, minuteRef)}
          />
          <span className="duration-input-segment-label">Horas</span>
        </div>

        <span className="duration-input-colon">:</span>

        <div className="duration-input-segment-group">
          <input
            ref={minuteRef}
            defaultValue={pad2(initialValue.minutes)}
            maxLength={2}
            inputMode="numeric"
            aria-label="Minutos"
            data-error={hasError || undefined}
            className="duration-input-segment"
            onBlur={() => handleBlur(minuteRef, 59)}
            onFocus={handleFocus}
            onInput={(e) => handleInput(e, hasSeconds ? secondRef : null)}
            onKeyDown={(e) => handleKeyDown(e, hasSeconds ? secondRef : null)}
          />
          <span className="duration-input-segment-label">Minutos</span>
        </div>

        {hasSeconds && (
          <>
            <span className="duration-input-colon">:</span>
            <div className="duration-input-segment-group">
              <input
                ref={secondRef}
                defaultValue={pad2(initialValue.seconds)}
                maxLength={2}
                inputMode="numeric"
                aria-label="Segundos"
                data-error={hasError || undefined}
                className="duration-input-segment"
                onBlur={() => handleBlur(secondRef, 59)}
                onFocus={handleFocus}
                onInput={(e) => handleInput(e, null)}
                onKeyDown={(e) => handleKeyDown(e, null)}
              />
              <span className="duration-input-segment-label">Segundos</span>
            </div>
          </>
        )}
      </div>

      {hasError && (
        <div className="duration-input-error" role="alert">
          <ErrorIcon className="duration-input-error-icon" aria-hidden="true" />
          <span className="duration-input-error-message">{errorMessage}</span>
        </div>
      )}
    </div>
  )
})

export default DurationInput
