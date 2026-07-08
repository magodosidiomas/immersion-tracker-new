import { useEffect, useState } from 'react'
import { getAppSettings, getSessionsByLanguage } from '../db'
import { formatFullDate, formatDateInput, parseDateInput } from '../utils/date'
import { sessionLabel, formatDuration } from '../utils/sessions'
import TopNav from '../components/TopNav'
import Dropdown from '../components/Dropdown'
import BottomSheet from '../components/BottomSheet'
import Calendar from '../components/Calendar'
import ListItem from '../components/ListItem'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import { ArrowBack, Schedule, Add } from '@nine-thirty-five/material-symbols-react/outlined'
import './LinkSession.css'

// Opened from ContentForm/EpisodeDetail's "Vincular sessão" button.
// Same date-dropdown + Calendar pattern as DayHistory (reused
// deliberately, per the person's note) — the difference is just what
// tapping a row does: here it selects that session for linking
// instead of opening EditSession, and it opens on today by default
// rather than whatever day was tapped in Statistics' calendar.
function LinkSession({ onSelect, onBack, onAddSession }) {
  const [activeId, setActiveId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()))
  const [allSessionDates, setAllSessionDates] = useState([])
  const [daySessions, setDaySessions] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    getAppSettings().then((settings) => setActiveId(settings.activeLanguageId))
  }, [])

  useEffect(() => {
    if (!activeId) return
    getSessionsByLanguage(activeId).then((sessions) => {
      setAllSessionDates(sessions.map((session) => session.date))
      setDaySessions(sessions.filter((session) => session.date === selectedDate))
    })
  }, [activeId, selectedDate])

  function handleSelectDay(dateStr) {
    setSelectedDate(dateStr)
    setPickerOpen(false)
  }

  return (
    <main className="link-session">
      <TopNav
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
        title="Vincular sessão"
        hasDivider
      />
      <div className="link-session-date-row">
        <Dropdown label={formatFullDate(selectedDate)} onClick={() => setPickerOpen(true)} />
      </div>
      <div className="link-session-content">
        <p className="link-session-label">Sessões</p>
        {daySessions.length === 0 ? (
          <EmptyState
            icon={<Schedule />}
            title="Nenhuma sessão nesse dia"
            description="Escolha outro dia ou comece uma nova sessão."
            buttonLabel="Nova sessão"
            buttonIcon={<Add />}
            onButtonClick={onAddSession}
          />
        ) : (
          <div className="link-session-card">
            {daySessions.map((session, index) => (
              <ListItem
                key={session.id}
                label={sessionLabel(session)}
                description={formatDuration(session.durationSeconds)}
                divider={index < daySessions.length - 1}
                onClick={() => onSelect(session)}
              />
            ))}
          </div>
        )}
      </div>
      {daySessions.length > 0 && (
        <div className="link-session-fab-row">
          <Button leadingIcon={<Add />} onClick={onAddSession}>
            Nova sessão
          </Button>
        </div>
      )}
      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Selecionar data" contentCard={false}>
        <div className="link-session-picker">
          <Calendar sessionDates={allSessionDates} initialDate={parseDateInput(selectedDate)} onSelectDay={handleSelectDay} />
        </div>
      </BottomSheet>
    </main>
  )
}

export default LinkSession
