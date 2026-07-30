import { useEffect, useState } from 'react'
import { getSessionsByLanguage } from '../db'
import { getWeekRange } from '../utils/date'
import LanguageTopNav from '../components/LanguageTopNav'
import TopNavDesktop from '../components/TopNavDesktop'
import BottomNav from '../components/BottomNav'
import DonutCard from '../components/DonutCard'
import NumericCard from '../components/NumericCard'
import MetasCard from '../components/MetasCard'
import SkillCard from '../components/SkillCard'
import FormatCard from '../components/FormatCard'
import ReceptionCard from '../components/ReceptionCard'
import ProductionCard from '../components/ProductionCard'
import StudyCard from '../components/StudyCard'
import { categoryBreakdown, formatDurationClock } from '../utils/sessions'
import { Home as HomeIcon, BarChart, Book, History } from '@nine-thirty-five/material-symbols-react/outlined'
import './Statistics.css'

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
  const weekTotalSeconds = sessions
    .filter((session) => session.date >= weekRange.start && session.date <= weekRange.end)
    .reduce((sum, session) => sum + session.durationSeconds, 0)

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
                size="large"
              />
              <NumericCard title="Tempo essa semana" number={formatDurationClock(weekTotalSeconds)} size="large" />
            </div>
            {/* Placeholder level/goal values — level system isn't implemented yet
                (see imerso-data-model notes on the level formula). Wired up here
                just to preview the card in the real layout; swap for real data
                once getMilestoneForLevel() exists. */}
            <MetasCard
              level={10}
              current="16h 30m"
              target="20h"
              progress={54}
              remaining="3h 30m"
              remainingCaption="pra bater a meta atual"
            />
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
