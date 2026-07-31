import { useEffect, useState } from 'react'
import { getSessionsByLanguage, getAppSettings } from '../db'
import { formatDateInput, formatElapsed, getStreakWeekDays, calculateStreak } from '../utils/date'
import { sessionLabel, formatDurationShort, groupSessionsByDate, getCategoryLabel } from '../utils/sessions'
import LanguageTopNav from '../components/LanguageTopNav'
import BottomNav from '../components/BottomNav'
import ListItem from '../components/ListItem'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import Alert from '../components/Alert'
import TopNavDesktop from '../components/TopNavDesktop'
import TimerWidget from '../components/TimerWidget'
import TimerCard from '../components/TimerCard'
import DailyGoalCard from '../components/DailyGoalCard'
import StreakCard from '../components/StreakCard'
import {
  Add,
  Schedule,
  BarChart,
  Book,
  History,
  Edit,
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
function Home({ timer, onOpenSettings, onOpenManageLanguages, onOpenAddLanguages, onOpenNewSession, onOpenManualSession, onOpenEditSession, onOpenStatistics, onOpenLibrary, onOpenHistorico, onOpenDailyGoal, onFinishTimer }) {
  const [activeId, setActiveId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [sessionError, setSessionError] = useState(false)
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(null)

  useEffect(() => {
    getAppSettings().then((settings) => setDailyGoalMinutes(settings.dailyGoalMinutes ?? null))
  }, [])

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
  const isEmpty = groups.length === 0 && !sessionError

  const now = new Date()
  const todayStr = formatDateInput(now)
  const sessionDates = sessions.map((session) => session.date)
  const todayTotalSeconds = sessions
    .filter((session) => session.date === todayStr)
    .reduce((sum, session) => sum + session.durationSeconds, 0)

  // Streak now tracks days the daily goal was met, not just any day with
  // a session — sum durations per day and keep the ones that clear the
  // goal. With no goal set yet, fall back to the old "any session"
  // behavior so the streak isn't just stuck at 0 until someone visits
  // Settings > Meta diária.
  const dailyTotals = new Map()
  for (const session of sessions) {
    dailyTotals.set(session.date, (dailyTotals.get(session.date) ?? 0) + session.durationSeconds)
  }
  const goalCompletedDates = dailyGoalMinutes
    ? [...dailyTotals.entries()].filter(([, seconds]) => seconds >= dailyGoalMinutes * 60).map(([date]) => date)
    : sessionDates

  const streakDays = calculateStreak(goalCompletedDates, now)
  const streakWeekDays = getStreakWeekDays(goalCompletedDates, now)

  // Category label lookup for the live timer, via shared getCategoryLabel.
  const { categoryLabel: timerCategoryLabel, subcategoryLabel: timerSubcategoryLabel } = getCategoryLabel(timer.category, timer.subcategory)

  return (
    <main className="home">
      <LanguageTopNav
        onOpenSettings={onOpenSettings}
        onOpenManageLanguages={onOpenManageLanguages}
        onOpenAddLanguages={onOpenAddLanguages}
        onActiveLanguageChange={setActiveId}
      />
      <TopNavDesktop
        title="Timer"
        titleIcon={<Schedule />}
        showSearch={false}
        secondaryActionLabel="Registro manual"
        secondaryActionIcon={<Edit />}
        onSecondaryActionClick={onOpenManualSession}
      />
      <div className={`home-history${isEmpty ? ' home-history-empty' : ''}`}>
        <TimerCard
          variant="home"
          status={timer.status}
          category={timer.category}
          subcategory={timer.subcategory}
          elapsedLabel={formatElapsed(Math.floor(timer.liveMs / 1000))}
          onSelectCategory={timer.setCategorySelection}
          onStart={() => timer.start(activeId)}
          onPause={timer.pause}
          onResume={timer.resume}
          onStop={onFinishTimer}
        />
        {groups.length > 0 && (
          <div className="home-stats">
            <div className="home-stats-row">
              <StreakCard value={formatStreakValue(streakDays)} days={streakWeekDays} />
              <DailyGoalCard goalMinutes={dailyGoalMinutes} todaySeconds={todayTotalSeconds} onClick={onOpenDailyGoal} />
            </div>
          </div>
        )}
        {sessionError ? (
          <Alert description="Erro ao carregar sessões. Tente fechar e reabrir o app." />
        ) : groups.length === 0 ? (
          <EmptyState
            style="responsive"
            icon={<Schedule />}
            title="Nenhuma sessão ainda"
            description="Escolha uma categoria e toque em play para começar"
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
        <div className={`home-fab-row${groups.length === 0 && !sessionError && timer.status === 'idle' ? ' home-fab-row-hidden' : ''}`}>
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
              onToggle={timer.status === 'running' ? timer.pause : timer.resume}
              onFinish={onFinishTimer}
              onDelete={timer.clearDraft}
            />
          )}
        </div>
        <BottomNav
          items={[
            { label: 'Timer', icon: <Schedule />, active: true },
            { label: 'Biblioteca', icon: <Book />, onClick: onOpenLibrary },
            { label: 'Estatísticas', icon: <BarChart />, onClick: onOpenStatistics },
            { label: 'Histórico', icon: <History />, onClick: onOpenHistorico },
          ]}
        />
      </div>
    </main>
  )
}

export default Home
