import { useEffect, useState } from 'react'
import { getSessionsByLanguage } from '../db'
import LanguageTopNav from '../components/LanguageTopNav'
import BottomNav from '../components/BottomNav'
import Calendar from '../components/Calendar'
import DonutCard from '../components/DonutCard'
import { categoryBreakdown } from '../utils/sessions'
import { Home as HomeIcon, BarChart } from '@nine-thirty-five/material-symbols-react/outlined'
import './Statistics.css'

// Second main tab, alongside Home — reached only via BottomNav. Same
// LanguageTopNav as Home (active language + switcher + settings), no
// back arrow since switching tabs isn't a drill-down.
function Statistics({ onOpenHome, onOpenSettings, onOpenManageLanguages, onOpenDay }) {
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
        onActiveLanguageChange={setActiveId}
      />
      <div className="statistics-content">
        <h1 className="statistics-title">Estatísticas</h1>
        <DonutCard groups={categoryBreakdown(sessions)} />
        <Calendar
          sessionDates={sessions.map((session) => session.date)}
          onSelectDay={onOpenDay}
        />
      </div>
      <div className="statistics-bottom-layer">
        <BottomNav
          items={[
            { label: 'Início', icon: <HomeIcon />, onClick: onOpenHome },
            { label: 'Estatísticas', icon: <BarChart />, active: true },
          ]}
        />
      </div>
    </main>
  )
}

export default Statistics
