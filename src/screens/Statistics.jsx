import { useEffect, useState } from 'react'
import { getSessionsByLanguage } from '../db'
import LanguageTopNav from '../components/LanguageTopNav'
import BottomNav from '../components/BottomNav'
import Calendar from '../components/Calendar'
import { Home as HomeIcon, BarChart } from '@nine-thirty-five/material-symbols-react/outlined'
import './Statistics.css'

// Second main tab, alongside Home — reached only via BottomNav. Same
// LanguageTopNav as Home (active language + switcher + settings), no
// back arrow since switching tabs isn't a drill-down.
function Statistics({ onOpenHome, onOpenSettings, onOpenManageLanguages, onOpenDay }) {
  const [activeId, setActiveId] = useState(null)
  const [sessionDates, setSessionDates] = useState([])

  // Same shape Home builds for its own Calendar usage in the showcase
  // (CalendarDemo): just the date strings, Calendar does its own
  // month-grid math from there.
  useEffect(() => {
    if (!activeId) return
    getSessionsByLanguage(activeId).then((sessions) =>
      setSessionDates(sessions.map((session) => session.date))
    )
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
        <Calendar sessionDates={sessionDates} onSelectDay={onOpenDay} />
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
