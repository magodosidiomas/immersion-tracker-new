import { useEffect, useRef, useState } from 'react'
import InputField from './InputField'
import SelectionChip from './SelectionChip'
import Button from './Button'
import BottomSheet from './BottomSheet'
import { Edit } from '@nine-thirty-five/material-symbols-react/outlined'
import { CATEGORIES } from '../data/categories'
import { pad2 } from '../utils/date'
import './SessionForm.css'

// HH:MM:SS — duração's view-mode display.
function formatHMS(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`
}

// HH:MM — início/fim's read-only display (see scope note below).
function formatHM(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

// The session-details form — same fields and edit rules whether you're
// finishing a just-run timer (NewSession) or editing one already saved
// to history (EditSession). Owns all its own editable state, seeded
// once from the initial* props; from then on only this form's own
// edits move the numbers. onSave receives the assembled fields
// (category/subcategory/date/startTime/endTime/durationSeconds) —
// whether that's a create or an update is the caller's concern, not
// this form's.
//
// Scope (current step, deliberately narrowed): only duração is
// editable. início is fixed at its initial value for the form's whole
// lifetime, and fim is never its own state — it's always derived as
// início + duração, so it can't drift out of sync with whatever
// duração says. Editing início/fim directly is designed (see
// imerso-data-model.md) but intentionally not wired up yet; that's a
// later step once this one's settled.
//
// Duração itself opens BottomSheet in its `modal` variant (always a
// centered card with a real close button, never an edge-anchored
// sheet — see BottomSheet.jsx) with three digit boxes (h/m/s). Each
// box is uncontrolled (defaultValue, not a value prop) — typing a
// digit shouldn't fight a React re-render for the cursor position.
// Nothing commits until "Confirmar" is tapped; "Cancelar" or
// dismissing the sheet discards the edit instead. durationEditKey
// remounts the three boxes fresh every time the sheet opens, so a
// discarded edit never leaks into the next time it's opened.
function SessionForm({
  initialStartAt,
  initialDurationSeconds,
  initialDate,
  initialCategory,
  initialSubcategory,
  onSave,
  saving = false,
  primaryLabel = 'Salvar',
  secondaryButton = null,
}) {
  const [durationSeconds, setDurationSeconds] = useState(initialDurationSeconds)
  const [sessionDate, setSessionDate] = useState(initialDate)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? CATEGORIES[0].key)
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    initialSubcategory ?? CATEGORIES[0].subcategories[0].key,
  )
  const [editingDuration, setEditingDuration] = useState(false)
  // Bumped on every openDurationEdit() call; used as the segment
  // boxes' key so they remount fresh from durationSeconds each time —
  // otherwise a cancelled edit's uncommitted DOM values (defaultValue
  // only applies at mount) would still be sitting there next open.
  const [durationEditKey, setDurationEditKey] = useState(0)

  // início is fixed for this form's lifetime; fim is always derived,
  // never independent state — see the scope note above.
  const startAt = initialStartAt
  const endAt = new Date(startAt.getTime() + durationSeconds * 1000)

  const hourRef = useRef(null)
  const minuteRef = useRef(null)
  const secondRef = useRef(null)

  // Focusing the hour box has to wait for editingDuration's re-render
  // to actually mount it — an effect tied to that flag, not a
  // setTimeout, so it runs right after React commits the new DOM.
  // Calling .focus() here fires handleSegmentFocus below just like any
  // other focus, so the box arrives empty rather than selected — same
  // "delete what was there" behavior whether a box is focused by this
  // initial open, by Enter advancing to it, or by typing two digits.
  useEffect(() => {
    if (!editingDuration) return
    hourRef.current?.focus()
  }, [editingDuration])

  function openDurationEdit() {
    setDurationEditKey((key) => key + 1)
    setEditingDuration(true)
  }

  function handleSegmentBlur(ref, max) {
    const value = clamp(parseInt(ref.current.value || '0', 10), 0, max)
    ref.current.value = pad2(value)
  }

  // Shared by all three boxes: every time one becomes the active
  // field — initial open, Enter advancing to it, or auto-advance after
  // two digits — it arrives empty instead of pre-filled, matching the
  // "delete what was there" spec rather than select-to-overwrite.
  function handleSegmentFocus(event) {
    event.target.value = ''
  }

  function handleConfirmDuration() {
    const h = parseInt(hourRef.current.value, 10)
    const m = parseInt(minuteRef.current.value, 10)
    const s = parseInt(secondRef.current.value, 10)
    setDurationSeconds(h * 3600 + m * 60 + s)
    setEditingDuration(false)
  }

  function handleCancelDuration() {
    setEditingDuration(false)
  }

  function handleSegmentInput(event, nextRef) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '').slice(0, 2)
    if (event.target.value.length === 2 && nextRef) nextRef.current?.focus()
  }

  // Enter advances to the next box (or just blurs on the last one) —
  // moving focus away fires the field's own onBlur, which still does
  // the pad/clamp, so that doesn't need repeating here.
  function handleSegmentKeyDown(event, nextRef) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (nextRef) nextRef.current?.focus()
    else event.target.blur()
  }

  function handlePickCategory(key) {
    setSelectedCategory(key)
    // Switching category resets the subcategory to that category's
    // first option — the previous pick may not even exist on this one.
    setSelectedSubcategory(CATEGORIES.find((item) => item.key === key).subcategories[0].key)
  }

  function handleSave() {
    onSave({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      date: sessionDate,
      startTime: startAt.toISOString(),
      endTime: endAt.toISOString(),
      durationSeconds,
    })
  }

  const selectedCategoryData = CATEGORIES.find((item) => item.key === selectedCategory)

  return (
    <>
      <div className="finish-session-body">
        <div className="finish-session-field-group finish-session-duration-group">
          <span className="category-sheet-label">Duração</span>
          <button
            type="button"
            className="finish-session-duration-row"
            aria-label="Editar duração"
            onClick={openDurationEdit}
          >
            <span className="finish-session-duration-display">{formatHMS(durationSeconds)}</span>
            <Edit className="finish-session-duration-icon" aria-hidden="true" />
          </button>
        </div>
        <div className="finish-session-time-row">
          <div className="finish-session-time-display">
            <span className="category-sheet-label">Início</span>
            <span className="finish-session-time-value">{formatHM(startAt)}</span>
          </div>
          <div className="finish-session-time-display">
            <span className="category-sheet-label">Fim</span>
            <span className="finish-session-time-value">{formatHM(endAt)}</span>
          </div>
        </div>
        <InputField label="Data" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
        <div className="finish-session-divider" />
        <div className="finish-session-field-group">
          <span className="category-sheet-label">Categoria</span>
          <div className="category-sheet-chips">
            {CATEGORIES.map((item) => (
              <SelectionChip
                key={item.key}
                label={item.label}
                hasLeadingIcon={false}
                hasTrailingIcon={false}
                selected={selectedCategory === item.key}
                onClick={() => handlePickCategory(item.key)}
              />
            ))}
          </div>
        </div>
        <div className="finish-session-field-group">
          <span className="category-sheet-label">Subcategoria</span>
          <div className="category-sheet-chips">
            {selectedCategoryData.subcategories.map((item) => (
              <SelectionChip
                key={item.key}
                label={item.label}
                hasLeadingIcon={false}
                hasTrailingIcon={false}
                selected={selectedSubcategory === item.key}
                onClick={() => setSelectedSubcategory(item.key)}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="finish-session-footer">
        <Button fullWidth onClick={handleSave} disabled={saving}>
          {primaryLabel}
        </Button>
        {secondaryButton}
      </div>
      <BottomSheet
        open={editingDuration}
        onClose={handleCancelDuration}
        title="Editar duração"
        contentCard={false}
        variant="modal"
        primaryButton={
          <Button fullWidth onClick={handleConfirmDuration}>
            Confirmar
          </Button>
        }
        secondaryButton={
          <Button variant="outline" fullWidth onClick={handleCancelDuration}>
            Cancelar
          </Button>
        }
      >
        <div className="finish-session-duration-edit" key={durationEditKey}>
          <div className="finish-session-duration-segment-group">
            <input
              ref={hourRef}
              id="duration-hour"
              defaultValue={pad2(Math.floor(durationSeconds / 3600))}
              maxLength={2}
              inputMode="numeric"
              className="finish-session-duration-segment"
              onBlur={() => handleSegmentBlur(hourRef, 23)}
              onFocus={handleSegmentFocus}
              onInput={(e) => handleSegmentInput(e, minuteRef)}
              onKeyDown={(e) => handleSegmentKeyDown(e, minuteRef)}
            />
            <label htmlFor="duration-hour" className="finish-session-duration-segment-label">
              Horas
            </label>
          </div>
          <span className="finish-session-duration-colon">:</span>
          <div className="finish-session-duration-segment-group">
            <input
              ref={minuteRef}
              id="duration-minute"
              defaultValue={pad2(Math.floor((durationSeconds % 3600) / 60))}
              maxLength={2}
              inputMode="numeric"
              className="finish-session-duration-segment"
              onBlur={() => handleSegmentBlur(minuteRef, 59)}
              onFocus={handleSegmentFocus}
              onInput={(e) => handleSegmentInput(e, secondRef)}
              onKeyDown={(e) => handleSegmentKeyDown(e, secondRef)}
            />
            <label htmlFor="duration-minute" className="finish-session-duration-segment-label">
              Minutos
            </label>
          </div>
          <span className="finish-session-duration-colon">:</span>
          <div className="finish-session-duration-segment-group">
            <input
              ref={secondRef}
              id="duration-second"
              defaultValue={pad2(durationSeconds % 60)}
              maxLength={2}
              inputMode="numeric"
              className="finish-session-duration-segment"
              onBlur={() => handleSegmentBlur(secondRef, 59)}
              onFocus={handleSegmentFocus}
              onInput={(e) => handleSegmentInput(e, null)}
              onKeyDown={(e) => handleSegmentKeyDown(e, null)}
            />
            <label htmlFor="duration-second" className="finish-session-duration-segment-label">
              Segundos
            </label>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}

export default SessionForm
