import { useEffect, useRef, useState } from 'react'
import InputField from './InputField'
import SelectionChip from './SelectionChip'
import Button from './Button'
import BottomSheet from './BottomSheet'
import DurationInput from './DurationInput'
import Alert from './Alert'
import MediaListItem from './MediaListItem'
import ListItem from './ListItem'
import Thumbnail from './Thumbnail'
import LinkSessionRow from './LinkSessionRow'
import { Edit, Add, DateRange, ChevronRight, Schedule, Delete, Visibility, LinkOff } from '@nine-thirty-five/material-symbols-react/outlined'
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

// HH:MM — time display.
function formatHM(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

// YYYY-MM-DD — value for <input type="date">.
function toDateString(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

// DD/MM — short date, used in the "Quando" summary row.
function formatDateShort(date) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// "Quando" summary row text — three formats depending on start/end:
// - same day, today: "Hoje, 12:30 - 13:30"
// - same day, other date: "13/04, 12:30 - 13:30"
// - different days: "13/04 23:50 → 14/04 00:15"
// Date/prefix pieces render in secondary color, times in primary — no bold.
function formatWhenText(start, end) {
  if (isSameDay(start, end)) {
    const prefix = isSameDay(start, new Date()) ? 'Hoje' : formatDateShort(start)
    return (
      <>
        <span className="finish-session-when-secondary">{prefix}, </span>
        <span className="finish-session-when-primary">{formatHM(start)} - {formatHM(end)}</span>
      </>
    )
  }
  return (
    <>
      <span className="finish-session-when-secondary">{formatDateShort(start)} </span>
      <span className="finish-session-when-primary">{formatHM(start)}</span>
      <span className="finish-session-when-secondary"> → </span>
      <span className="finish-session-when-secondary">{formatDateShort(end)} </span>
      <span className="finish-session-when-primary">{formatHM(end)}</span>
    </>
  )
}

// Returns a new Date with the date portion replaced by dateStr ("YYYY-MM-DD"),
// keeping the original time.
function setDatePortion(existingDate, dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const result = new Date(existingDate)
  result.setFullYear(y, m - 1, d)
  return result
}

// Returns a new Date with the time portion replaced, keeping the original date.
function setTimePortion(existingDate, hours, minutes) {
  const result = new Date(existingDate)
  result.setHours(hours, minutes, 0, 0)
  return result
}

// The session-details form — same fields and edit rules whether you're
// finishing a just-run timer (NewSession) or editing one already saved
// to history (EditSession). Owns all its own editable state, seeded
// once from the initial* props; from then on only this form's own
// edits move the numbers. onSave receives the assembled fields
// (category/subcategory/date/startTime/endTime/durationSeconds).
//
// State model: startAt and endAt are independent full Dates.
// durationSeconds is derived. Editing duration recalculates endAt.
// Editing a time updates only the time portion of that Date.
// Editing a date updates only the date portion.
//
// Validation:
// - Duration dialog: blocks zero (error inside DurationInput)
// - Time dialogs: block result < 1 min difference (error inside dialog)
// - Form level: invalid state (endAt <= startAt or diff < 60s) shows
//   Alert + disables Salvar
function SessionForm({
  initialStartAt,
  initialDurationSeconds,
  initialCategory,
  initialSubcategory,
  onSave,
  saving = false,
  primaryLabel = 'Salvar',
  // Desktop-only footer: presence of onCancel switches the footer to the
  // modalActionPanel layout (Excluir/Descartar left, Cancelar + Salvar
  // right). Mobile never passes these — its delete trigger lives in the
  // TopNav trailing icon instead, and there's no Cancelar there.
  onDelete = null,
  deleteLabel = 'Excluir',
  onCancel = null,
  // Which "page" this instance is showing. Lifted to the parent (not
  // owned here) so the parent's TopNav/Modal header can react to it —
  // this component just renders whichever body matches the current value.
  subScreen = 'main', // 'main' | 'datetime'
  onOpenDateTime,
  linkedContents = [],
  onAddContent,
  onRemoveContent,
  onOpenContent,
  hideContentSection = false,
}) {
  const [startAt, setStartAt] = useState(initialStartAt)
  const [endAt, setEndAt] = useState(
    new Date(initialStartAt.getTime() + initialDurationSeconds * 1000),
  )

  // Track which date field was last changed to show contextual error copy.
  const [lastChangedDate, setLastChangedDate] = useState(null)

  // Becomes true after the user's first successful edit to
  // duração/início/fim/data. Before that, an invalid duration (e.g. a
  // fresh manual entry, or a sub-1-min timer) is shown as neutral, not
  // an error — nothing was "wrong" yet, the user just hasn't set it.
  const [touched, setTouched] = useState(false)

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

  const [durationError, setDurationError] = useState(null)
  const [startTimeError, setStartTimeError] = useState(null)
  const [endTimeError, setEndTimeError] = useState(null)

  const durationInputRef = useRef(null)
  const startInputRef = useRef(null)
  const endInputRef = useRef(null)

  // durationSeconds and validity are always derived.
  const durationSeconds = Math.round((endAt.getTime() - startAt.getTime()) / 1000)
  const isValid = durationSeconds >= 60

  let formAlert = null
  if (touched) {
    if (durationSeconds < 0) {
      formAlert =
        lastChangedDate === 'end'
          ? 'Data final precisa ser depois da data de início. Ajuste as datas para continuar.'
          : 'Data de início precisa ser antes da data final. Ajuste as datas para continuar.'
    } else if (durationSeconds < 60) {
      formAlert = 'Início e término precisam ter pelo menos 1 minuto de diferença.'
    }
  }

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
    setDurationError(null)
    setEditingDuration(true)
  }

  function handleConfirmDuration() {
    const { hours, minutes, seconds } = durationInputRef.current.getValue()
    const newDuration = hours * 3600 + minutes * 60 + seconds
    if (newDuration === 0) {
      setDurationError('A duração não pode ser zero.')
      return
    }
    setEndAt(new Date(startAt.getTime() + newDuration * 1000))
    setDurationError(null)
    setEditingDuration(false)
    setTouched(true)
  }

  function handleDurationPreset(minutes) {
    setEndAt(new Date(startAt.getTime() + minutes * 60 * 1000))
    setTouched(true)
  }

  // --- Start time handlers ---

  function openStartEdit() {
    setStartEditKey((k) => k + 1)
    setStartTimeError(null)
    setEditingStart(true)
  }

  function handleConfirmStart() {
    const { hours, minutes } = startInputRef.current.getValue()
    const newStartAt = setTimePortion(startAt, hours, minutes)
    if (endAt.getTime() - newStartAt.getTime() < 60000) {
      setStartTimeError('Início e término precisam ter pelo menos 1 minuto de diferença.')
      return
    }
    setStartAt(newStartAt)
    setStartTimeError(null)
    setEditingStart(false)
    setTouched(true)
  }

  function handleCancelStart() {
    setStartTimeError(null)
    setEditingStart(false)
  }

  // --- End time handlers ---

  function openEndEdit() {
    setEndEditKey((k) => k + 1)
    setEndTimeError(null)
    setEditingEnd(true)
  }

  function handleConfirmEnd() {
    const { hours, minutes } = endInputRef.current.getValue()
    const newEndAt = setTimePortion(endAt, hours, minutes)
    if (newEndAt.getTime() - startAt.getTime() < 60000) {
      setEndTimeError('Início e término precisam ter pelo menos 1 minuto de diferença.')
      return
    }
    setEndAt(newEndAt)
    setEndTimeError(null)
    setEditingEnd(false)
    setTouched(true)
  }

  function handleCancelEnd() {
    setEndTimeError(null)
    setEditingEnd(false)
  }

  // --- Date handlers ---

  function handleStartDateChange(e) {
    if (!e.target.value) return
    setStartAt(setDatePortion(startAt, e.target.value))
    setLastChangedDate('start')
    setTouched(true)
  }

  function handleEndDateChange(e) {
    if (!e.target.value) return
    setEndAt(setDatePortion(endAt, e.target.value))
    setLastChangedDate('end')
    setTouched(true)
  }

  // --- Category handlers ---

  function handlePickCategory(key) {
    setSelectedCategory(key)
    setSelectedSubcategory(CATEGORIES.find((item) => item.key === key).subcategories[0].key)
  }

  function handleSave() {
    if (!isValid) return
    onSave({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      date: toDateString(startAt),
      startTime: startAt.toISOString(),
      endTime: endAt.toISOString(),
      durationSeconds,
    })
  }

  const selectedCategoryData = CATEGORIES.find((item) => item.key === selectedCategory)

  // Shared between both pages this component can show — defined once so
  // neither branch below has to repeat the bottom sheet markup.
  const sheets = (
    <>
      {/* Duração */}
      <BottomSheet
        open={editingDuration}
        onClose={() => setEditingDuration(false)}
        title="Editar duração"
        contentCard={false}
        variant="modal"
        primaryButton={
          <Button fullWidth onClick={handleConfirmDuration}>
            Confirmar
          </Button>
        }
        secondaryButton={
          <Button variant="outline" fullWidth onClick={() => setEditingDuration(false)}>
            Cancelar
          </Button>
        }
      >
        <DurationInput
          ref={durationInputRef}
          key={durationEditKey}
          hasSeconds
          initialValue={{
            hours: Math.floor(Math.max(0, durationSeconds) / 3600),
            minutes: Math.floor((Math.max(0, durationSeconds) % 3600) / 60),
            seconds: Math.max(0, durationSeconds) % 60,
          }}
          errorMessage={durationError}
        />
      </BottomSheet>

      {/* Início */}
      <BottomSheet
        open={editingStart}
        onClose={handleCancelStart}
        title="Editar horário de início"
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
          hasSeconds={false}
          initialValue={{ hours: startAt.getHours(), minutes: startAt.getMinutes(), seconds: 0 }}
          errorMessage={startTimeError}
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
          hasSeconds={false}
          initialValue={{ hours: endAt.getHours(), minutes: endAt.getMinutes(), seconds: 0 }}
          errorMessage={endTimeError}
        />
      </BottomSheet>
    </>
  )

  // "Editar horário e data" — Início/Fim (time + date) plus a read-only-
  // looking (but still clickable) Duração summary. Reached from the
  // Quando rows below; back navigation is owned by the parent screen.
  if (subScreen === 'datetime') {
    return (
      <>
        <div className="finish-session-body">
          <div className="finish-session-time-grid">
            <InputField label="Início" value={formatHM(startAt)} readOnly onClick={openStartEdit} />
            <InputField
              label="Data de início"
              type="date"
              value={toDateString(startAt)}
              onChange={handleStartDateChange}
            />
          </div>

          {formAlert && <Alert type="error" description={formAlert} />}

          <div className="finish-session-time-grid">
            <InputField label="Fim" value={formatHM(endAt)} readOnly onClick={openEndEdit} />
            <InputField
              label="Data final"
              type="date"
              value={toDateString(endAt)}
              onChange={handleEndDateChange}
            />
          </div>

          <div className="finish-session-when-card">
            <ListItem
              label="Duração"
              leadingIcon={<Schedule />}
              extraText={isValid ? formatHMS(durationSeconds) : '--:--:--'}
              onClick={openDurationEdit}
            />
          </div>
        </div>
        {sheets}
      </>
    )
  }

  return (
    <>
      <div className="finish-session-body">
        {/* Duration */}
        <div className="finish-session-field-group finish-session-duration-group">
          <span className="category-sheet-label">Duração</span>
          <button
            type="button"
            className="finish-session-duration-row"
            aria-label="Editar duração"
            onClick={openDurationEdit}
          >
            <span
              className="finish-session-duration-display"
              data-invalid={touched && !isValid ? 'true' : undefined}
            >
              {isValid ? formatHMS(durationSeconds) : '--:--:--'}
            </span>
            <Edit className="finish-session-duration-icon" aria-hidden="true" />
          </button>
          <div className="category-sheet-chips duration-shortcut-chips">
            {[15, 30, 45, 60].map((minutes) => (
              <SelectionChip
                key={minutes}
                label={minutes < 60 ? `${minutes}m` : '1h'}
                hasLeadingIcon={false}
                hasTrailingIcon={false}
                selected={durationSeconds === minutes * 60}
                onClick={() => handleDurationPreset(minutes)}
              />
            ))}
          </div>
          {!isValid && (
            <div className="finish-session-duration-alert">
              <Alert type="error" description="A sessão precisa ter no mínimo 1 minuto." />
            </div>
          )}
        </div>

        <div className="finish-session-divider" />

        {/* Quando */}
        <div className="finish-session-field-group">
          <span className="category-sheet-label">Quando</span>
          <button type="button" className="finish-session-when-card" onClick={onOpenDateTime}>
            <span className="list-item-icon"><DateRange /></span>
            <span className="finish-session-when-text">{formatWhenText(startAt, endAt)}</span>
            <span className="list-item-icon"><ChevronRight /></span>
          </button>
        </div>

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

        {!hideContentSection && (
        <>
        <div className="finish-session-divider" />
        <div className="finish-session-field-group">
          {linkedContents.length > 0 ? (
            <>
              <span className="category-sheet-label">Conteúdos</span>
              <div className="finish-session-contents-card">
                {linkedContents.map((content, index) => (
                  <MediaListItem
                    key={content.id}
                    title={content.title}
                    subtitle={content.subtitle}
                    divider={index < linkedContents.length - 1}
                    thumbnail={<Thumbnail size="sm" src={content.thumbnail} alt={content.title} />}
                    menu={[
                      onOpenContent && {
                        label: 'Ver',
                        icon: <Visibility />,
                        onClick: () => onOpenContent(content),
                      },
                      {
                        label: 'Desvincular conteúdo',
                        icon: <LinkOff />,
                        danger: true,
                        onClick: () => onRemoveContent?.(content.id),
                      },
                    ].filter(Boolean)}
                  />
                ))}
              </div>
              <Button variant="outline" leadingIcon={<Add />} onClick={onAddContent}>
                Vincular conteúdo
              </Button>
            </>
          ) : (
            <>
              <span className="category-sheet-label">Conteúdos vinculados</span>
              <LinkSessionRow label="Vincular conteúdo" onClick={onAddContent} />
            </>
          )}
        </div>
        </>
        )}
      </div>

      {/* Mobile: single fullWidth Salvar — delete lives in the parent's
         TopNav trailing icon instead. Desktop (onCancel present):
         modalActionPanel layout — Excluir/Descartar left, Cancelar +
         Salvar grouped right. */}
      {onCancel ? (
        <div className="finish-session-footer finish-session-footer--desktop">
          {onDelete && (
            <Button variant="destructive-ghost" leadingIcon={<Delete />} onClick={onDelete}>
              {deleteLabel}
            </Button>
          )}
          <div className="finish-session-footer-actions">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !isValid}>
              {primaryLabel}
            </Button>
          </div>
        </div>
      ) : (
        <div className="finish-session-footer">
          <Button fullWidth onClick={handleSave} disabled={saving || !isValid}>
            {primaryLabel}
          </Button>
        </div>
      )}

      {sheets}
    </>
  )
}

export default SessionForm
