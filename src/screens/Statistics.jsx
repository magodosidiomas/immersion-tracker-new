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
import { categoryBreakdown, formatDurationShort } from '../utils/sessions'
import { getLevelProgress } from '../utils/levels'
import { Home as HomeIcon, BarChart, Book, History } from '@nine-thirty-five/material-symbols-react/outlined'
import './Statistics.css'

// Second main tab, alongside Home and Biblioteca — reached only via
// BottomNav. Same LanguageTopNav as Home (active language + switcher
// + settings), no back arrow since switching tabs isn't a drill-down.
function Statistics({ timerBanner = null, onOpenHome, onOpenSettings, onOpenManageLanguages, onOpenAddLanguages, onOpenLibrary, onOpenHistorico }) {
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
  const totalSeconds = sessions.reduce((sum, session) => sum + session.durationSeconds, 0)
  const weekTotalSeconds = sessions
    .filter((session) => session.date >= weekRange.start && session.date <= weekRange.end)
    .reduce((sum, session) => sum + session.durationSeconds, 0)
  const levelProgress = getLevelProgress(totalSeconds)

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
        {timerBanner}
        <h1 className="statistics-title">Estatísticas</h1>
        <div className="statistics-overview">
          <div className="statistics-overview-left">
            <div className="statistics-time-row">
              <NumericCard title="Tempo total" number={formatDurationShort(totalSeconds)} size="large" />
              <NumericCard title="Tempo essa semana" number={formatDurationShort(weekTotalSeconds)} size="large" />
            </div>
            <MetasCard
              level={levelProgress.level}
              current={formatDurationShort(levelProgress.currentSeconds)}
              target={formatDurationShort(levelProgress.targetSeconds)}
              progress={levelProgress.progress}
              remaining={formatDurationShort(levelProgress.remainingSeconds)}
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
