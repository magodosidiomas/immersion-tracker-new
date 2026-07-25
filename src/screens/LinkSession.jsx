import { useEffect, useState } from 'react'
import { getAppSettings, getSessionsByLanguage } from '../db'
import { formatFullDate, formatDateInput } from '../utils/date'
import { sessionLabel, formatDuration } from '../utils/sessions'
import TopNav from '../components/TopNav'
import Dropdown from '../components/Dropdown'
import ListItem from '../components/ListItem'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import { ArrowBack, Schedule, Add, ChevronRight } from '@nine-thirty-five/material-symbols-react/outlined'
import './LinkSession.css'

// Opened from ContentForm/EpisodeDetail's "Vincular sessão" button.
// Same date-dropdown pattern as DayHistory (reused deliberately, per
// the person's note): Dropdown shows the formatted label, the actual
// picker is the OS-native <input type="date"> — same as EditSession —
// laid transparently on top. Difference from DayHistory is just what
// tapping a row does: here it selects that session for linking
// instead of opening EditSession, and it opens on today by default
// rather than whatever day was tapped in Statistics' calendar.
function LinkSession({ onSelect, onBack, onAddSession, refreshTick = 0, headless = false, contentTitle = null }) {
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

  // contentTitle (the conteúdo this picker was opened from, e.g. from
  // ContentForm/EpisodeDetail's "Vincular sessão") renders as a plain
  // subtitle under the header — it's context about the screen itself,
  // not a row of content, so it deliberately sits outside the card
  // below and carries no divider of its own.
  const body = (
    <div className="link-session-wrap">
      {contentTitle && <p className="link-session-subtitle">{contentTitle}</p>}
      <div className="link-session-card">
        <div className="link-session-date-row">
          <div className="link-session-date-picker">
            <Dropdown label={formatFullDate(selectedDate)} />
            <input
              type="date"
              className="link-session-date-input"
              aria-label="Selecionar data"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              onClick={(event) => event.target.showPicker?.()}
            />
          </div>
        </div>
        <div className="link-session-content">
          {daySessions.length === 0 ? (
            <EmptyState
              icon={<Schedule />}
              title="Nenhuma sessão nesse dia"
              description="Suas sessões desse dia vão aparecer aqui."
              buttonLabel="Adicionar sessão"
              buttonIcon={<Add />}
              onButtonClick={onAddSession}
              style="plain"
            />
          ) : (
            <>
            <p className="link-session-label">Sessões</p>
            <div className="link-session-list">
              {daySessions.map((session, index) => (
                <ListItem
                  key={session.id}
                  label={sessionLabel(session)}
                  description={formatDuration(session.durationSeconds)}
                  divider={index < daySessions.length - 1}
                  trailingIcon={<ChevronRight />}
                  onClick={() => onSelect(session)}
                />
              ))}
            </div>
            <Button variant="ghost" fullWidth leadingIcon={<Add />} onClick={onAddSession}>
              Adicionar sessão nesse dia
            </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // headless: rendered inside a Modal (desktop) that already supplies
  // its own header/back button — skip this screen's own TopNav/main
  // wrapper so there isn't a duplicate header.
  if (headless) return body

  return (
    <main className="link-session">
      <TopNav
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
        title="Vincular sessão"
      />
      {body}
    </main>
  )
}

export default LinkSession
