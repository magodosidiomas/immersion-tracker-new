import { useEffect, useState } from 'react'
import { getAppSettings, getSessionsByLanguage, createSession, deleteSession } from '../db'
import { formatFullDate, parseDateInput } from '../utils/date'
import { sessionLabel, formatDuration } from '../utils/sessions'
import { useLongPress } from '../hooks/useLongPress'
import TopNav from '../components/TopNav'
import Dropdown from '../components/Dropdown'
import BottomSheet from '../components/BottomSheet'
import Calendar from '../components/Calendar'
import ListItem from '../components/ListItem'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  ArrowBack,
  Schedule,
  Close,
  ContentCopy,
  Delete,
} from '@nine-thirty-five/material-symbols-react/outlined'
import './DayHistory.css'

// Reached by tapping a day in Statistics' Calendar. The date row below
// TopNav is a standalone Dropdown (not TopNav's own hasDropdown — the
// Figma keeps it as its own row, with its own divider, under a plain
// "Histórico" TopNav) that opens a BottomSheet with the same Calendar
// component as the picker. No day-by-day stepper, no new component:
// jumping to any day is just "open the calendar, tap a day" — the
// same shape Material's own date picker uses.
//
// contentCard={false} on the BottomSheet matters here: Calendar
// already paints its own card surface (bg-surface-default), so the
// sheet's default card wrapper (bg-surface-card) would stack a third,
// unwanted background behind it instead of the two layers Figma shows
// (sheet background, then the calendar's own).
//
// Long-press selection: pressing a row enters selection mode with
// that row already checked, swaps TopNav for a contextual one (close
// left; duplicate — only meaningful for exactly one selected row —
// and delete right), and turns every row's tap into a toggle instead
// of opening it. Delete always confirms, even for a single row.
function DayHistory({ date, onBack, onOpenEditSession }) {
  const [activeId, setActiveId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(date)
  const [allSessionDates, setAllSessionDates] = useState([])
  const [daySessions, setDaySessions] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const selectionMode = selectedIds.length > 0
  const bindLongPress = useLongPress()

  useEffect(() => {
    getAppSettings().then((settings) => setActiveId(settings.activeLanguageId))
  }, [])

  // Refetches the full language history on every date change too —
  // simplest way to keep both the day's session list and the picker's
  // active-day marks correct without a separate "just this day" query.
  useEffect(() => {
    if (!activeId) return
    getSessionsByLanguage(activeId).then((sessions) => {
      setAllSessionDates(sessions.map((session) => session.date))
      setDaySessions(sessions.filter((session) => session.date === selectedDate))
    })
  }, [activeId, selectedDate, refreshTick])

  function refreshSessions() {
    setRefreshTick((tick) => tick + 1)
  }

  function handleSelectDay(dateStr) {
    setSelectedDate(dateStr)
    setPickerOpen(false)
  }

  function toggleSelected(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id],
    )
  }

  function exitSelectionMode() {
    setSelectedIds([])
  }

  async function handleDuplicate() {
    const [id] = selectedIds
    const original = daySessions.find((session) => session.id === id)
    if (!original) return
    const rest = { ...original }
    delete rest.id
    delete rest.createdAt
    await createSession(rest)
    exitSelectionMode()
    refreshSessions()
  }

  async function handleDeleteConfirmed() {
    await Promise.all(selectedIds.map((id) => deleteSession(id)))
    setConfirmOpen(false)
    exitSelectionMode()
    refreshSessions()
  }

  return (
    <main className="day-history">
      {selectionMode ? (
        <TopNav
          title={`${selectedIds.length} selecionado${selectedIds.length === 1 ? '' : 's'}`}
          leadingIcon={
            <button type="button" className="top-nav-icon-reset" onClick={exitSelectionMode} aria-label="Fechar seleção">
              <Close />
            </button>
          }
          trailingLeft={
            selectedIds.length === 1 && (
              <button type="button" className="top-nav-icon-reset" onClick={handleDuplicate} aria-label="Duplicar">
                <ContentCopy />
              </button>
            )
          }
          trailingRight={
            <button type="button" className="top-nav-icon-reset" onClick={() => setConfirmOpen(true)} aria-label="Excluir">
              <Delete />
            </button>
          }
          hasDivider
        />
      ) : (
        <TopNav
          leadingIcon={
            <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
              <ArrowBack />
            </button>
          }
          title="Histórico"
          hasDivider
        />
      )}
      <div className="day-history-date-row">
        <Dropdown label={formatFullDate(selectedDate)} onClick={() => setPickerOpen(true)} />
      </div>
      <div className="day-history-content">
        <p className="day-history-label">Sessões</p>
        {daySessions.length === 0 ? (
          <EmptyState
            icon={<Schedule />}
            title="Nenhuma sessão nesse dia"
            description="Escolha outro dia ou comece uma nova sessão."
          />
        ) : (
          <div className="day-history-card">
            {daySessions.map((session, index) => (
              <ListItem
                key={session.id}
                label={sessionLabel(session)}
                description={formatDuration(session.durationSeconds)}
                divider={index < daySessions.length - 1}
                selectionMode={selectionMode}
                selected={selectedIds.includes(session.id)}
                {...bindLongPress(
                  session.id,
                  () => setSelectedIds([session.id]),
                  () => (selectionMode ? toggleSelected(session.id) : onOpenEditSession(session)),
                )}
              />
            ))}
          </div>
        )}
      </div>
      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Selecionar data" contentCard={false}>
        <div className="day-history-picker">
          <Calendar sessionDates={allSessionDates} initialDate={parseDateInput(selectedDate)} onSelectDay={handleSelectDay} />
        </div>
      </BottomSheet>
      <ConfirmDialog
        open={confirmOpen}
        title={selectedIds.length === 1 ? 'Excluir sessão?' : `Excluir ${selectedIds.length} sessões?`}
        description="Essa ação não pode ser desfeita."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirmed}
      />
    </main>
  )
}

export default DayHistory
