import { useEffect, useState } from 'react'
import { getAppSettings, getSessionsByLanguage } from '../db'
import { formatFullDate, formatDateInput } from '../utils/date'
import { sessionLabel, formatDuration } from '../utils/sessions'
import TopNav from '../components/TopNav'
import Dropdown from '../components/Dropdown'
import ListItem from '../components/ListItem'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import { ArrowBack, Schedule, Add } from '@nine-thirty-five/material-symbols-react/outlined'
import './LinkSession.css'

// Opened from ContentForm/EpisodeDetail's "Vincular sessão" button.
// Same date-dropdown pattern as DayHistory (reused deliberately, per
// the person's note): Dropdown shows the formatted label, the actual
// picker is the OS-native <input type="date"> — same as EditSession —
// laid transparently on top. Difference from DayHistory is just what
// tapping a row does: here it selects that session for linking
// instead of opening EditSession, and it opens on today by default
// rather than whatever day was tapped in Statistics' calendar.
function LinkSession({ onSelect, onBack, onAddSession, refreshTick = 0 }) {
  const [activeId, setActiveId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()))
  const [daySessions, setDaySessions] = useState([])

  useEffect(() => {
    getAppSettings().then((settings) => setActiveId(settings.activeLanguageId))
  }, [])

  useEffect(() => {
    if (!activeId) return
    getSessionsByLanguage(activeId).then((sessions) => {
      setDaySessions(sessions.filter((session) => session.date === selectedDate))
    })
  }, [activeId, selectedDate, refreshTick])

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
        <div className="link-session-date-picker">
          <Dropdown label={formatFullDate(selectedDate)} />
          <input
            type="date"
            className="link-session-date-input"
            aria-label="Selecionar data"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </div>
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
    </main>
  )
}

export default LinkSession
