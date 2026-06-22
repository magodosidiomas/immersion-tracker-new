import { useEffect, useRef, useState } from 'react'
import InputField from './InputField'
import SelectionChip from './SelectionChip'
import Button from './Button'
import BottomSheet from './BottomSheet'
import DurationInput from './DurationInput'
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

// HH:MM — início/fim's view-mode display.
function formatHM(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

// Returns a new Date with the same date portion as `reference` but
// with hours/minutes replaced, and seconds zeroed out.
function buildDateWithTime(reference, hours, minutes) {
  const d = new Date(reference)
  d.setHours(hours, minutes, 0, 0)
  return d
}

// The session-details form — same fields and edit rules whether you're
// finishing a just-run timer (NewSession) or editing one already saved
// to history (EditSession). Owns all its own editable state, seeded
// once from the initial* props; from then on only this form's own
// edits move the numbers. onSave receives the assembled fields
// (category/subcategory/date/startTime/endTime/durationSeconds).
//
// Edit rules (from imerso-data-model.md):
// - editing duração → recalculates fim, início stays
// - editing início → recalculates duração, fim stays
// - editing fim → recalculates duração, início stays
// - fim before início is blocked: error shown inside the fim sheet,
//   Confirmar stays disabled until the value is valid
//
// Each time input opens a BottomSheet (modal variant) with a
// DurationInput. An editKey is bumped on every open so DurationInput
// remounts fresh — discarded edits never leak into the next open.
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
  const [startAt, setStartAt] = useState(initialStartAt)
  const [durationSeconds, setDurationSeconds] = useState(initialDurationSeconds)
  const [sessionDate, setSessionDate] = useState(initialDate)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? CATEGORIES[0].key)
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    initialSubcategory ?? CATEGORIES[0].subcategories[0].key,
  )

  const [editingDuration, setEditingDuration] = useState(false)
  const [editingStart, setEditingStart] = useState(false)
  const [editingEnd, setEditingEnd] = useState(false)

  const [durationEditKey, setDurationEditKey] = useState(0)
  const [startEditKey, setStartEditKey] = useState(0)
  const [endEditKey, setEndEditKey] = useState(0)

  const [endTimeError, setEndTimeError] = useState(null)

  // endAt is always derived — never independent state.
  const endAt = new Date(startAt.getTime() + durationSeconds * 1000)

  const durationInputRef = useRef(null)
  const startInputRef = useRef(null)
  const endInputRef = useRef(null)

  // Auto-focus the first field each time a sheet opens. Tied to the
  // open flag so it fires after React commits the new DOM (same
  // pattern as the original hourRef auto-focus).
  useEffect(() => {
    if (editingDuration) durationInputRef.current?.focusFirst()
  }, [editingDuration])

  useEffect(() => {
    if (editingStart) startInputRef.current?.focusFirst()
  }, [editingStart])

  useEffect(() => {
    if (editingEnd) endInputRef.current?.focusFirst()
  }, [editingEnd])

  // --- Duration handlers ---

  function openDurationEdit() {
    setDurationEditKey((k) => k + 1)
    setEditingDuration(true)
  }

  function handleConfirmDuration() {
    const { hours, minutes, seconds } = durationInputRef.current.getValue()
    setDurationSeconds(hours * 3600 + minutes * 60 + seconds)
    setEditingDuration(false)
  }

  function handleCancelDuration() {
    setEditingDuration(false)
  }

  // --- Start handlers ---

  function openStartEdit() {
    setStartEditKey((k) => k + 1)
    setEditingStart(true)
  }

  function handleConfirmStart() {
    const { hours, minutes } = startInputRef.current.getValue()
    const newStartAt = buildDateWithTime(startAt, hours, minutes)
    // fim stays put; duration is recalculated from the gap.
    const newDuration = Math.max(0, (endAt.getTime() - newStartAt.getTime()) / 1000)
    setStartAt(newStartAt)
    setDurationSeconds(newDuration)
    setEditingStart(false)
  }

  function handleCancelStart() {
    setEditingStart(false)
  }

  // --- End handlers ---

  function openEndEdit() {
    setEndEditKey((k) => k + 1)
    setEndTimeError(null)
    setEditingEnd(true)
  }

  function handleConfirmEnd() {
    const { hours, minutes } = endInputRef.current.getValue()
    const newEndAt = buildDateWithTime(startAt, hours, minutes)
    if (newEndAt <= startAt) {
      setEndTimeError(
        `O horário de término precisa ser depois do início (${formatHM(startAt)}).`,
      )
      return // sheet stays open
    }
    setDurationSeconds((newEndAt.getTime() - startAt.getTime()) / 1000)
    setEndTimeError(null)
    setEditingEnd(false)
  }

  function handleCancelEnd() {
    setEndTimeError(null)
    setEditingEnd(false)
  }

  // --- Category handlers ---

  function handlePickCategory(key) {
    setSelectedCategory(key)
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
            <button
              type="button"
              className="finish-session-time-button"
              aria-label="Editar início"
              onClick={openStartEdit}
            >
              <span className="finish-session-time-value">{formatHM(startAt)}</span>
              <Edit className="finish-session-duration-icon" aria-hidden="true" />
            </button>
          </div>
          <div className="finish-session-time-display">
            <span className="category-sheet-label">Fim</span>
            <button
              type="button"
              className="finish-session-time-button"
              aria-label="Editar fim"
              onClick={openEndEdit}
            >
              <span className="finish-session-time-value">{formatHM(endAt)}</span>
              <Edit className="finish-session-duration-icon" aria-hidden="true" />
            </button>
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

      {/* Duração */}
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
        <DurationInput
          ref={durationInputRef}
          key={durationEditKey}
          hasSeconds
          initialValue={{
            hours: Math.floor(durationSeconds / 3600),
            minutes: Math.floor((durationSeconds % 3600) / 60),
            seconds: durationSeconds % 60,
          }}
        />
      </BottomSheet>

      {/* Início */}
      <BottomSheet
        open={editingStart}
        onClose={handleCancelStart}
        title="Editar horário inicial"
        contentCard={false}
        variant="modal"
        primaryButton={
          <Button fullWidth onClick={handleConfirmStart}>
            Confirmar
          </Button>
        }
        secondaryButton={
          <Button variant="outline" fullWidth onClick={handleCancelStart}>
            Cancelar
          </Button>
        }
      >
        <DurationInput
          ref={startInputRef}
          key={startEditKey}
          initialValue={{ hours: startAt.getHours(), minutes: startAt.getMinutes(), seconds: 0 }}
        />
      </BottomSheet>

      {/* Fim */}
      <BottomSheet
        open={editingEnd}
        onClose={handleCancelEnd}
        title="Editar horário final"
        contentCard={false}
        variant="modal"
        primaryButton={
          <Button fullWidth onClick={handleConfirmEnd}>
            Confirmar
          </Button>
        }
        secondaryButton={
          <Button variant="outline" fullWidth onClick={handleCancelEnd}>
            Cancelar
          </Button>
        }
      >
        <DurationInput
          ref={endInputRef}
          key={endEditKey}
          initialValue={{ hours: endAt.getHours(), minutes: endAt.getMinutes(), seconds: 0 }}
          errorMessage={endTimeError}
        />
      </BottomSheet>
    </>
  )
}

export default SessionForm
