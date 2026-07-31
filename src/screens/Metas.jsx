import { useEffect, useState } from 'react'
import { getSessionsByLanguage, getAppSettings } from '../db'
import MetasCard from '../components/MetasCard'
import ListItem from '../components/ListItem'
import TopNav from '../components/TopNav'
import TopNavDesktop from '../components/TopNavDesktop'
import { formatDurationShort, getFaltaVerb } from '../utils/sessions'
import { getLevelProgress, getMilestoneHours, LISTED_LEVELS_COUNT } from '../utils/levels'
import { ArrowBack, Check, Lock } from '@nine-thirty-five/material-symbols-react/outlined'
import './Metas.css'

// Reached by tapping the MetasCard in Statistics. A drill-down, but on
// desktop it uses the same TopNavDesktop + app-content--full treatment
// as the main tabs (Statistics/Library/Historico) rather than a narrow
// phone-column — the sidebar's "Estatísticas" item stays highlighted
// and doubles as the way back (see App.jsx's Sidebar activeScreen
// mapping), same as clicking any other sidebar item.
//
// Self-fetches sessions for the active language, same convention as
// Statistics, so the level/progress numbers here always match the
// MetasCard that opened it.
function Metas({ onBack }) {
  const [activeId, setActiveId] = useState(null)
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    getAppSettings().then((settings) => setActiveId(settings.activeLanguageId))
  }, [])

  useEffect(() => {
    if (!activeId) return
    getSessionsByLanguage(activeId).then(setSessions)
  }, [activeId])

  const totalSeconds = sessions.reduce((sum, session) => sum + session.durationSeconds, 0)
  const levelProgress = getLevelProgress(totalSeconds)

  const levels = Array.from({ length: LISTED_LEVELS_COUNT }, (_, index) => {
    const level = index + 1
    return {
      level,
      lowerHours: getMilestoneHours(level - 1),
      upperHours: getMilestoneHours(level),
    }
  })

  return (
    <main className="metas-screen">
      <TopNav
        title="Metas"
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
      />
      <TopNavDesktop title="Metas" showSearch={false} />
      <div className="metas-screen-content">
        <MetasCard
          level={levelProgress.level}
          current={formatDurationShort(levelProgress.currentSeconds)}
          target={formatDurationShort(levelProgress.targetSeconds)}
          progress={levelProgress.progress}
          remaining={formatDurationShort(levelProgress.remainingSeconds)}
          remainingPrefix={getFaltaVerb(levelProgress.remainingSeconds)}
          remainingCaption="pra bater a meta atual"
        />

        <div className="metas-screen-list-card">
          {levels.map((row, index) => {
            const status =
              row.level < levelProgress.level ? 'done' : row.level === levelProgress.level ? 'current' : 'locked'
            return (
              <ListItem
                key={row.level}
                label={`Nível ${row.level}`}
                extraText={`${row.lowerHours}h - ${row.upperHours}h`}
                divider={index < levels.length - 1}
                disabled={status === 'locked'}
                leadingIcon={
                  status === 'done' ? (
                    <span className="metas-level-badge metas-level-badge--done">
                      <Check />
                    </span>
                  ) : status === 'current' ? (
                    <span className="metas-level-badge metas-level-badge--current" />
                  ) : (
                    <Lock />
                  )
                }
              />
            )
          })}
        </div>
      </div>
    </main>
  )
}

export default Metas
