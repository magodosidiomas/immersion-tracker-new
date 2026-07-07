import { useEffect, useState } from 'react'
import { getSessionsByLanguage } from '../db'
import { formatDateInput, formatElapsed, getWeekRange, getStreakWeekDays, calculateStreak } from '../utils/date'
import { sessionLabel, formatDurationShort, groupSessionsByDate, getCategoryLabel } from '../utils/sessions'
import LanguageTopNav from '../components/LanguageTopNav'
import BottomNav from '../components/BottomNav'
import ListItem from '../components/ListItem'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'
import TimerWidget from '../components/TimerWidget'
import NumericCard from '../components/NumericCard'
import StreakCard from '../components/StreakCard'
import {
  Add,
  Schedule,
  Home as HomeIcon,
  BarChart,
  Book,
} from '@nine-thirty-five/material-symbols-react/outlined'
import './Home.css'

const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// Header above each date's card: "Hoje" for today, otherwise "D mon"
// (e.g. "14 nov"), matching the Figma copy. dateStr is the session's
// stored 'YYYY-MM-DD' — parsed back into day/month directly instead of
// going through a Date object, so there's no local-midnight timezone
// drift to worry about.
function formatGroupLabel(dateStr, todayStr) {
  if (dateStr === todayStr) return 'Hoje'
  const [, month, day] = dateStr.split('-').map(Number)
  return `${day} ${MONTH_LABELS[month - 1]}`
}

// "1 dia" / "7 dias" — singular only at exactly 1, matching normal
// Portuguese pluralization.
function formatStreakValue(days) {
  return `${days} ${days === 1 ? 'dia' : 'dias'}`
}

// First real screen after onboarding: the top nav (active language +
// switcher + settings entry point, via LanguageTopNav), a history list
// (or EmptyState when the active language has no sessions yet), and a
// FAB that opens the timer (NewSession).
function Home({ timer, onOpenSettings, onOpenManageLanguages, onOpenNewSession, onOpenEditSession, onOpenStatistics, onOpenLibrary }) {
  const [activeId, setActiveId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [sessionError, setSessionError] = useState(false)

  useEffect(() => {
    if (!activeId) return
    let cancelled = false
    getSessionsByLanguage(activeId)
      .then((data) => {
        if (cancelled) return
        setSessions(data)
        setSessionError(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Erro ao carregar sessões:', err)
        setSessionError(true)
      })
    return () => {
      cancelled = true
    }
  }, [activeId])

  const groups = groupSessionsByDate(sessions)
  const now = new Date()
  const todayStr = formatDateInput(now)
  const weekRange = getWeekRange(now)
  const sessionDates = sessions.map((session) => session.date)
  const todayTotalSeconds = sessions
    .filter((session) => session.date === todayStr)
    .reduce((sum, session) => sum + session.durationSeconds, 0)
  const weekTotalSeconds = sessions
    .filter((session) => session.date >= weekRange.start && session.date <= weekRange.end)
    .reduce((sum, session) => sum + session.durationSeconds, 0)
  const streakDays = calculateStreak(sessionDates, now)
  const streakWeekDays = getStreakWeekDays(sessionDates, now)

  // Category label lookup for the live timer, via shared getCategoryLabel.
  const { categoryLabel: timerCategoryLabel, subcategoryLabel: timerSubcategoryLabel } = getCategoryLabel(timer.category, timer.subcategory)

  return (
    <main className="home">
      <LanguageTopNav
        onOpenSettings={onOpenSettings}
        onOpenManageLanguages={onOpenManageLanguages}
        onActiveLanguageChange={setActiveId}
      />
      <div className="home-history">
        {groups.length > 0 && (
          <div className="home-stats">
            <StreakCard value={formatStreakValue(streakDays)} days={streakWeekDays} />
            <div className="home-stats-row">
              <NumericCard title="Hoje" number={formatDurationShort(todayTotalSeconds)} />
              <NumericCard title="Essa semana" number={formatDurationShort(weekTotalSeconds)} />
            </div>
          </div>
        )}
        {sessionError ? (
          <Alert description="Erro ao carregar sessões. Tente fechar e reabrir o app." />
        ) : groups.length === 0 ? (
          <EmptyState
            icon={<Schedule />}
            title="Nenhuma sessão ainda"
            description="Toque em nova sessão pra registrar sua primeira sessão"
          />
        ) : (
          groups.map((group) => (
            <section key={group.date} className="home-history-group">
              <p className="home-history-label">{formatGroupLabel(group.date, todayStr)}</p>
              <div className="home-history-card">
                {group.sessions.map((session, index) => (
                  <ListItem
                    key={session.id}
                    label={sessionLabel(session)}
                    description={formatDurationShort(session.durationSeconds)}
                    divider={index < group.sessions.length - 1}
                    onClick={() => onOpenEditSession(session)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      <div className="home-bottom-layer">
        <div className="home-fab-row">
          {timer.status === 'idle' ? (
            <Button leadingIcon={<Add />} onClick={onOpenNewSession}>
              Nova sessão
            </Button>
          ) : (
            <TimerWidget
              elapsedLabel={formatElapsed(Math.floor(timer.liveMs / 1000))}
              category={timerCategoryLabel}
              subcategory={timerSubcategoryLabel}
              running={timer.status === 'running'}
              onClick={onOpenNewSession}
              onToggle={timer.status === 'running' ? timer.pause : timer.resume}
            />
          )}
        </div>
        <BottomNav
          items={[
            { label: 'Início', icon: <HomeIcon />, active: true },
            { label: 'Estatísticas', icon: <BarChart />, onClick: onOpenStatistics },
            { label: 'Biblioteca', icon: <Book />, onClick: onOpenLibrary },
          ]}
        />
      </div>
    </main>
  )
}

export default Home
