import { useEffect, useState } from 'react'
import { getAppSettings, getSessionsByLanguage, createSession, deleteSession } from '../db'
import { formatFullDate } from '../utils/date'
import { sessionLabel, formatDuration } from '../utils/sessions'
import { useLongPress } from '../hooks/useLongPress'
import TopNav from '../components/TopNav'
import Dropdown from '../components/Dropdown'
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
// "Histórico" TopNav). It shows the formatted label, but the actual
// picker is the OS-native <input type="date"> — same as EditSession —
// laid transparently on top of the Dropdown so a tap opens the native
// picker while the pill keeps its designed look.
//
// Long-press selection: pressing a row enters selection mode with
// that row already checked, swaps TopNav for a contextual one (close
// left; duplicate — only meaningful for exactly one selected row —
// and delete right), and turns every row's tap into a toggle instead
// of opening it. Delete always confirms, even for a single row.
function DayHistory({ date, onBack, onOpenEditSession }) {
  const [activeId, setActiveId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(date)
  const [daySessions, setDaySessions] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const selectionMode = selectedIds.length > 0
  const bindLongPress = useLongPress()

  useEffect(() => {
    getAppSettings().then((settings) => setActiveId(settings.activeLanguageId))
  }, [])

  useEffect(() => {
    if (!activeId) return
    getSessionsByLanguage(activeId).then((sessions) => {
      setDaySessions(sessions.filter((session) => session.date === selectedDate))
    })
  }, [activeId, selectedDate, refreshTick])

  function refreshSessions() {
    setRefreshTick((tick) => tick + 1)
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
        <div className="day-history-date-picker">
          <Dropdown label={formatFullDate(selectedDate)} />
          <input
            type="date"
            className="day-history-date-input"
            aria-label="Selecionar data"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>
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
