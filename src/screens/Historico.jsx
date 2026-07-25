import { useEffect, useState } from 'react'
import { getAppSettings, getSessionsByLanguage } from '../db'
import { formatDateInput, MONTH_LABELS_FULL } from '../utils/date'
import { sessionLabel, formatDuration } from '../utils/sessions'
import TopNav from '../components/TopNav'
import TopNavDesktop from '../components/TopNavDesktop'
import BottomNav from '../components/BottomNav'
import Calendar from '../components/Calendar'
import ListItem from '../components/ListItem'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import {
  ArrowBack,
  Settings,
  Add,
  Schedule,
  History,
  Home as HomeIcon,
  BarChart,
  Book,
} from '@nine-thirty-five/material-symbols-react/outlined'
import './Historico.css'

// "Sessões · 18 de abril 2026" — parsed straight from the stored
// 'YYYY-MM-DD' string, same no-Date-object convention as Home's
// formatGroupLabel, so there's no local-midnight timezone drift.
function formatSessionsLabel(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return `Sessões · ${day} de ${MONTH_LABELS_FULL[month - 1].toLowerCase()} ${year}`
}

// Fourth (last) main tab, alongside Home/Estatísticas/Biblioteca —
// reached via BottomNav/Sidebar. Pairs Statistics' Calendar with a
// day-filtered session list (same fetch/filter shape as DayHistory),
// so picking any day updates the list below instead of drilling into
// a separate screen. No LanguageTopNav here: the mobile TopNav is
// plain title + settings shortcut, matching the Figma frame exactly,
// with activeLanguageId resolved the same way DayHistory does
// (getAppSettings) rather than via a switcher.
function Historico({
  onOpenHome,
  onOpenSettings,
  onOpenNewSession,
  onOpenEditSession,
  onOpenStatistics,
  onOpenLibrary,
}) {
  const [activeId, setActiveId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput(new Date()))

  useEffect(() => {
    getAppSettings().then((settings) => setActiveId(settings.activeLanguageId))
  }, [])

  useEffect(() => {
    if (!activeId) return
    let cancelled = false
    getSessionsByLanguage(activeId).then((data) => {
      if (!cancelled) setSessions(data)
    })
    return () => {
      cancelled = true
    }
  }, [activeId])

  const daySessions = sessions.filter((session) => session.date === selectedDate)
  const sessionDates = sessions.map((session) => session.date)

  return (
    <main className="historico">
      <TopNav
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onOpenHome} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
        title="Histórico"
        trailingRight={
          <button type="button" className="top-nav-icon-reset" onClick={onOpenSettings} aria-label="Configurações">
            <Settings />
          </button>
        }
        hasDivider
      />
      <TopNavDesktop
        title="Histórico"
        showSearch={false}
        actionLabel="Nova sessão"
        actionIcon={<Add />}
        onActionClick={onOpenNewSession}
      />
      <div className="historico-content">
        <section className="historico-calendar-section">
          <p className="historico-label">Dias com sessão</p>
          <Calendar sessionDates={sessionDates} selectedDate={selectedDate} onSelectDay={setSelectedDate} />
        </section>
        <section className="historico-history-section">
          <p className="historico-label">{formatSessionsLabel(selectedDate)}</p>
          {daySessions.length === 0 ? (
            <EmptyState
              icon={<Schedule />}
              title="Nenhuma sessão nesse dia"
              description="Escolha outro dia ou comece uma nova sessão."
            />
          ) : (
            <div className="historico-history-card">
              {daySessions.map((session, index) => (
                <ListItem
                  key={session.id}
                  label={sessionLabel(session)}
                  description={formatDuration(session.durationSeconds)}
                  divider={index < daySessions.length - 1}
                  onClick={() => onOpenEditSession(session)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      <div className="historico-bottom-layer">
        <div className="historico-fab-row">
          <Button leadingIcon={<Add />} onClick={onOpenNewSession}>
            Nova sessão
          </Button>
        </div>
        <BottomNav
          items={[
            { label: 'Início', icon: <HomeIcon />, onClick: onOpenHome },
            { label: 'Estatísticas', icon: <BarChart />, onClick: onOpenStatistics },
            { label: 'Biblioteca', icon: <Book />, onClick: onOpenLibrary },
            { label: 'Histórico', icon: <History />, active: true },
          ]}
        />
      </div>
    </main>
  )
}

export default Historico
