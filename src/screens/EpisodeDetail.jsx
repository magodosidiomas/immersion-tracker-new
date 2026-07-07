import { useEffect, useState } from 'react'
import { getSessionsForContent, linkSessionContent } from '../db'
import { sessionLabel, formatDurationShort } from '../utils/sessions'
import { formatDateInput, formatGroupLabel } from '../utils/date'
import TopNav from '../components/TopNav'
import ListItem from '../components/ListItem'
import Button from '../components/Button'
import { ArrowBack, Add, ChevronRight } from '@nine-thirty-five/material-symbols-react/outlined'
import './EpisodeDetail.css'

// Sessão-linking screen for one piece of "série episode" or "filme"
// content — reused for both since the shape is identical (a heading
// + Sessões vinculadas card + Vincular sessão), only the heading and
// top nav title differ:
//   - episode given: "Série · T# E#" heading, "Episódios - Série" nav
//   - no episode (filme case): the filme's own name as heading,
//     "Sessões" as nav title — filmes skip the episódios layer
//     entirely, so this screen is reached directly from Gerenciar
//     filmes instead of through an intermediate episode list.
//
// contentId is always resolved by the caller (the episode's own
// content row, or the filme's) — this screen just fetches/links
// sessions against it, same self-fetching convention as everywhere
// else now.
function EpisodeDetail({ contentId, seriesName = '', episode = null, onAddSession, onBack }) {
  const [linkedSessions, setLinkedSessions] = useState([])
  const heading = episode ? `${seriesName} · T${episode.season} E${episode.episode}` : seriesName
  const topNavTitle = episode ? `Episódios - ${seriesName}` : 'Sessões'

  function refresh() {
    if (!contentId) return
    getSessionsForContent(contentId).then((sessions) => {
      const todayStr = formatDateInput(new Date())
      setLinkedSessions(
        sessions.map((session) => ({
          id: session.id,
          label: sessionLabel(session),
          description: `${formatGroupLabel(session.date, todayStr)} · ${formatDurationShort(session.durationSeconds)}`,
        })),
      )
    })
  }

  useEffect(refresh, [contentId])

  function handleAddSession() {
    onAddSession(async (session) => {
      await linkSessionContent(session.id, contentId)
      refresh()
    })
  }

  return (
    <main className="episode-detail">
      <TopNav
        title={topNavTitle}
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
      />
      <div className="episode-detail-content">
        <h2 className="episode-detail-title">{heading}</h2>

        <div className="episode-detail-field-group">
          <span className="episode-detail-label">Sessões vinculadas</span>
          {linkedSessions.length > 0 ? (
            <div className="episode-detail-sessions-card">
              {linkedSessions.map((session, index) => (
                <ListItem
                  key={session.id}
                  label={session.label}
                  description={session.description}
                  divider={index < linkedSessions.length - 1}
                  trailingIcon={<ChevronRight />}
                />
              ))}
            </div>
          ) : (
            <p className="episode-detail-sessions-empty">Nenhuma sessão ainda</p>
          )}
          <Button variant="outline" fullWidth leadingIcon={<Add />} onClick={handleAddSession}>
            Vincular sessão
          </Button>
        </div>
      </div>
    </main>
  )
}

export default EpisodeDetail
