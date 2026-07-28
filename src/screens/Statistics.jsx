import { useEffect, useState } from 'react'
import { getSessionsByLanguage } from '../db'
import { getWeekRange, getStreakWeekDays, calculateStreak } from '../utils/date'
import LanguageTopNav from '../components/LanguageTopNav'
import TopNavDesktop from '../components/TopNavDesktop'
import BottomNav from '../components/BottomNav'
import DonutCard from '../components/DonutCard'
import NumericCard from '../components/NumericCard'
import StreakCard from '../components/StreakCard'
import SkillCard from '../components/SkillCard'
import FormatCard from '../components/FormatCard'
import ReceptionCard from '../components/ReceptionCard'
import ProductionCard from '../components/ProductionCard'
import StudyCard from '../components/StudyCard'
import { categoryBreakdown, formatDurationClock } from '../utils/sessions'
import { Home as HomeIcon, BarChart, Book, History } from '@nine-thirty-five/material-symbols-react/outlined'
import './Statistics.css'

// "1 dia" / "7 dias" — singular only at exactly 1, matching Home's copy.
function formatStreakValue(days) {
  return `${days} ${days === 1 ? 'dia' : 'dias'}`
}

// Second main tab, alongside Home and Biblioteca — reached only via
// BottomNav. Same LanguageTopNav as Home (active language + switcher
// + settings), no back arrow since switching tabs isn't a drill-down.
function Statistics({ onOpenHome, onOpenSettings, onOpenManageLanguages, onOpenAddLanguages, onOpenLibrary, onOpenHistorico }) {
  const [activeId, setActiveId] = useState(null)
  const [sessions, setSessions] = useState([])

  // Full session objects, not just dates — Calendar only needs the
  // dates (mapped below) but DataCard's category breakdown needs
  // category/subcategory/durationSeconds too. One fetch, two derived
  // views, instead of querying the same language's sessions twice.
  useEffect(() => {
    if (!activeId) return
    getSessionsByLanguage(activeId).then(setSessions)
  }, [activeId])

  const now = new Date()
  const weekRange = getWeekRange(now)
  const sessionDates = sessions.map((session) => session.date)
  const weekTotalSeconds = sessions
    .filter((session) => session.date >= weekRange.start && session.date <= weekRange.end)
    .reduce((sum, session) => sum + session.durationSeconds, 0)
  const streakDays = calculateStreak(sessionDates, now)
  const streakWeekDays = getStreakWeekDays(sessionDates, now)

  return (
    <main className="statistics">
      <LanguageTopNav
        onOpenSettings={onOpenSettings}
        onOpenManageLanguages={onOpenManageLanguages}
        onOpenAddLanguages={onOpenAddLanguages}
        onActiveLanguageChange={setActiveId}
      />
      <TopNavDesktop title="Estatísticas" showSearch={false} />
      <div className="statistics-content">
        <h1 className="statistics-title">Estatísticas</h1>
        <div className="statistics-overview">
          <div className="statistics-overview-left">
            <div className="statistics-time-row">
              <NumericCard
                title="Tempo total"
                number={formatDurationClock(sessions.reduce((sum, session) => sum + session.durationSeconds, 0))}
              />
              <NumericCard title="Tempo essa semana" number={formatDurationClock(weekTotalSeconds)} />
            </div>
            <StreakCard value={formatStreakValue(streakDays)} days={streakWeekDays} />
          </div>
          <DonutCard title="Por categoria" groups={categoryBreakdown(sessions)} />
        </div>
        <div className="statistics-cards">
          <div className="statistics-row">
            <SkillCard groups={categoryBreakdown(sessions)} />
            <FormatCard groups={categoryBreakdown(sessions)} />
          </div>
          <div className="statistics-row statistics-row-triple">
            <ReceptionCard groups={categoryBreakdown(sessions)} />
            <ProductionCard groups={categoryBreakdown(sessions)} />
            <StudyCard groups={categoryBreakdown(sessions)} />
          </div>
        </div>
      </div>
      <div className="statistics-bottom-layer">
        <BottomNav
          items={[
            { label: 'Início', icon: <HomeIcon />, onClick: onOpenHome },
            { label: 'Estatísticas', icon: <BarChart />, active: true },
            { label: 'Biblioteca', icon: <Book />, onClick: onOpenLibrary },
            { label: 'Histórico', icon: <History />, onClick: onOpenHistorico },
          ]}
        />
      </div>
    </main>
  )
}

export default Statistics
