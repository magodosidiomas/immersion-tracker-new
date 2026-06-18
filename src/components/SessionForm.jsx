import { useState } from 'react'
import InputField from './InputField'
import SelectionChip from './SelectionChip'
import Button from './Button'
import { Edit, CalendarToday } from '@nine-thirty-five/material-symbols-react/outlined'
import { CATEGORIES } from '../data/categories'
import { pad2 } from '../utils/date'
import './SessionForm.css'

// HH:MM:SS — value for the duration <input type="time" step="1">
function formatHMS(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`
}

function parseHMS(value) {
  const [h, m, s] = value.split(':').map(Number)
  return h * 3600 + m * 60 + (s || 0)
}

// HH:MM — value for the início/fim <input type="time">
function formatHM(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

// Returns a new Date: same day as base, time-of-day from "HH:MM".
function withTime(base, hm) {
  const [h, m] = hm.split(':').map(Number)
  const next = new Date(base)
  next.setHours(h, m, 0, 0)
  return next
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
// Edit rules (locked in imerso-data-model.md):
// - editing duração recalculates fim, início stays put
// - editing início or fim recalculates duração, the other stays put
// - impossible combinations (fim before início) are blocked and the
//   edited field snaps back to its last valid value. Each time+field
//   is rendered as an uncontrolled input keyed by a counter — the key
//   only bumps when an external edit changes that field's value (or
//   when a blocked edit needs to snap it back), never on its own edit,
//   which is what kept typing broken in fully-controlled inputs (the
//   browser resets the focused segment whenever JS reassigns .value,
//   even to the identical string).
// "Data" is independent of those three — it's which calendar day the
// session counts toward (for future dashboards/streaks), not part of
// the duration math, so it's edited on its own.
function SessionForm({
  initialStartAt,
  initialEndAt,
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
  const [endAt, setEndAt] = useState(initialEndAt)
  const [durationSeconds, setDurationSeconds] = useState(initialDurationSeconds)
  const [sessionDate, setSessionDate] = useState(initialDate)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory ?? CATEGORIES[0].key)
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    initialSubcategory ?? CATEGORIES[0].subcategories[0].key,
  )

  // Each time field is uncontrolled (defaultValue, not value), keyed
  // by these counters. The key only bumps when a *different* field's
  // edit changes this field's value, or when a blocked edit needs to
  // snap this field back to its last valid value. It never bumps on
  // the field's own edit, preserving cursor/segment focus while typing.
  const [startKey, setStartKey] = useState(0)
  const [durationKey, setDurationKey] = useState(0)
  const [endKey, setEndKey] = useState(0)

  function handleDurationChange(e) {
    if (!e.target.value) return
    const seconds = parseHMS(e.target.value)
    setDurationSeconds(seconds)
    setEndAt(new Date(startAt.getTime() + seconds * 1000))
    setEndKey((k) => k + 1) // fim changed out from under it — force refresh
  }

  function handleStartChange(e) {
    if (!e.target.value) return
    const nextStart = withTime(startAt, e.target.value)
    const nextDuration = Math.round((endAt - nextStart) / 1000)
    if (nextDuration < 0) {
      // início can't land after fim — snap back to last valid value
      setStartKey((k) => k + 1)
      return
    }
    setStartAt(nextStart)
    setDurationSeconds(nextDuration)
    setDurationKey((k) => k + 1) // duração changed out from under it
  }

  function handleEndChange(e) {
    if (!e.target.value) return
    const nextEnd = withTime(endAt, e.target.value)
    const nextDuration = Math.round((nextEnd - startAt) / 1000)
    if (nextDuration < 0) {
      // fim can't land before início — snap back to last valid value
      setEndKey((k) => k + 1)
      return
    }
    setEndAt(nextEnd)
    setDurationSeconds(nextDuration)
    setDurationKey((k) => k + 1) // duração changed out from under it
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
        <div className="finish-session-field-group">
          <span className="category-sheet-label">Duração</span>
          <div className="finish-session-duration-row">
            <input
              key={durationKey}
              type="time"
              step="1"
              className="finish-session-duration-input"
              defaultValue={formatHMS(durationSeconds)}
              onChange={handleDurationChange}
              aria-label="Editar duração"
            />
            <Edit className="finish-session-duration-icon" aria-hidden="true" />
          </div>
        </div>
        <div className="finish-session-time-row">
          <InputField
            key={startKey}
            label="Início"
            type="time"
            defaultValue={formatHM(startAt)}
            onChange={handleStartChange}
          />
          <InputField
            key={endKey}
            label="Fim"
            type="time"
            defaultValue={formatHM(endAt)}
            onChange={handleEndChange}
          />
        </div>
        <InputField
          label="Data"
          type="date"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
          trailingIcon={<CalendarToday />}
        />
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
    </>
  )
}

export default SessionForm
