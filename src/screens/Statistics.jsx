import { useEffect, useState } from 'react'
import { getSessionsByLanguage } from '../db'
import LanguageTopNav from '../components/LanguageTopNav'
import BottomNav from '../components/BottomNav'
import Calendar from '../components/Calendar'
import DonutCard from '../components/DonutCard'
import NumericCard from '../components/NumericCard'
import SkillCard from '../components/SkillCard'
import FormatCard from '../components/FormatCard'
import ReceptionCard from '../components/ReceptionCard'
import ProductionCard from '../components/ProductionCard'
import StudyCard from '../components/StudyCard'
import { categoryBreakdown, formatDurationClock } from '../utils/sessions'
import { Home as HomeIcon, BarChart, Book } from '@nine-thirty-five/material-symbols-react/outlined'
import './Statistics.css'

// Second main tab, alongside Home and Biblioteca — reached only via
// BottomNav. Same LanguageTopNav as Home (active language + switcher
// + settings), no back arrow since switching tabs isn't a drill-down.
function Statistics({ onOpenHome, onOpenSettings, onOpenManageLanguages, onOpenAddLanguages, onOpenDay, onOpenLibrary }) {
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

  return (
    <main className="statistics">
      <LanguageTopNav
        onOpenSettings={onOpenSettings}
        onOpenManageLanguages={onOpenManageLanguages}
        onOpenAddLanguages={onOpenAddLanguages}
        onActiveLanguageChange={setActiveId}
      />
      <div className="statistics-content">
        <h1 className="statistics-title">Estatísticas</h1>
        <NumericCard
          size="large"
          title="Tempo total"
          number={formatDurationClock(sessions.reduce((sum, session) => sum + session.durationSeconds, 0))}
        />
        <div className="statistics-cards">
          <div className="statistics-row">
            <Calendar
              sessionDates={sessions.map((session) => session.date)}
              onSelectDay={onOpenDay}
            />
            <DonutCard title="Por categoria" groups={categoryBreakdown(sessions)} />
          </div>
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
          ]}
        />
      </div>
    </main>
  )
}

export default Statistics
