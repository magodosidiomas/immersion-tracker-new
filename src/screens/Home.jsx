import { useEffect, useState } from 'react'
import { getSessionsByLanguage } from '../db'
import { CATEGORIES } from '../data/categories'
import { formatDateInput, formatElapsed, getWeekRange, getStreakWeekDays, calculateStreak } from '../utils/date'
import LanguageTopNav from '../components/LanguageTopNav'
import BottomNav from '../components/BottomNav'
import ListItem from '../components/ListItem'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import TimerWidget from '../components/TimerWidget'
import NumericCard from '../components/NumericCard'
import StreakCard from '../components/StreakCard'
import {
  PlayArrow,
  Schedule,
  Home as HomeIcon,
  BarChart,
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

// "1h 16m 24s" / "32m 15s" / "15m 20s" — each unit only shows once
// it's non-zero reading top-down, matching the Figma copy (no leading
// "0h" on a 32-minute session).
function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

// "3h 23m" / "32m" — like formatDuration but stops at minutes: these
// feed the Hoje/Essa semana stat cards, which follow the Figma copy's
// coarser precision (no seconds) since they're totals, not a single
// session's readout.
function formatTotalDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

// "1 dia" / "7 dias" — singular only at exactly 1, matching normal
// Portuguese pluralization.
function formatStreakValue(days) {
  return `${days} ${days === 1 ? 'dia' : 'dias'}`
}

function sessionLabel(session) {
  const category = CATEGORIES.find((item) => item.key === session.category)
  const subcategory = category?.subcategories.find((item) => item.key === session.subcategory)
  if (!category) return '—'
  return subcategory ? `${category.label} · ${subcategory.label}` : category.label
}

// Newest day first, newest session first within a day. Days group by
// the session's stored `date` string directly — lexicographic
// 'YYYY-MM-DD' sort is also chronological sort, no Date parsing needed
// just to order them.
function groupSessionsByDate(sessions) {
  const groups = []
  for (const session of sessions) {
    let group = groups.find((g) => g.date === session.date)
    if (!group) {
      group = { date: session.date, sessions: [] }
      groups.push(group)
    }
    group.sessions.push(session)
  }
  groups.sort((a, b) => (a.date < b.date ? 1 : -1))
  for (const group of groups) {
    group.sessions.sort((a, b) => (a.startTime < b.startTime ? 1 : -1))
  }
  return groups
}

// First real screen after onboarding: the top nav (active language +
// switcher + settings entry point, via LanguageTopNav), a history list
// (or EmptyState when the active language has no sessions yet), and a
// FAB that opens the timer (NewSession).
function Home({ timer, onOpenSettings, onOpenManageLanguages, onOpenNewSession, onOpenEditSession, onOpenStatistics }) {
  const [activeId, setActiveId] = useState(null)
  const [sessions, setSessions] = useState([])

  // Refetches on every activeId change — both an explicit switch in
  // LanguageTopNav and Home's own mount (Home fully unmounts/remounts
  // when navigating away and back, e.g. after saving a new or edited
  // session, so this alone is enough to pick up fresh data without a
  // separate "refresh" signal).
  useEffect(() => {
    if (!activeId) return
    getSessionsByLanguage(activeId).then(setSessions)
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

  // Same category/subcategory key→label lookup sessionLabel() does for
  // history rows, applied to the live timer instead of a saved session.
  const timerCategoryData = CATEGORIES.find((item) => item.key === timer.category)
  const timerSubcategoryLabel = timerCategoryData?.subcategories.find((item) => item.key === timer.subcategory)?.label

  return (
    <main className="home">
      <LanguageTopNav
        onOpenSettings={onOpenSettings}
        onOpenManageLanguages={onOpenManageLanguages}
        onActiveLanguageChange={setActiveId}
      />
      <div className="home-history">
        <div className="home-stats">
          <StreakCard value={formatStreakValue(streakDays)} days={streakWeekDays} />
          <div className="home-stats-row">
            <NumericCard title="Hoje" number={formatTotalDuration(todayTotalSeconds)} />
            <NumericCard title="Essa semana" number={formatTotalDuration(weekTotalSeconds)} />
          </div>
        </div>
        {groups.length === 0 ? (
          <EmptyState
            icon={<Schedule />}
            title="Nenhuma sessão ainda"
            description="Toque em iniciar timer pra registrar sua primeira sessão"
            buttonLabel="Iniciar timer"
            buttonIcon={<PlayArrow />}
            onButtonClick={onOpenNewSession}
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
                    description={formatDuration(session.durationSeconds)}
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
            <Button leadingIcon={<PlayArrow />} onClick={onOpenNewSession}>
              Iniciar timer
            </Button>
          ) : (
            <TimerWidget
              elapsedLabel={formatElapsed(Math.floor(timer.liveMs / 1000))}
              category={timerCategoryData?.label ?? null}
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
          ]}
        />
      </div>
    </main>
  )
}

export default Home
