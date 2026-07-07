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
function EpisodeDetail({
  seriesName = '',
  episode = null,
  linkedSessions = [],
  onAddSession,
  onBack,
}) {
  const heading = episode ? `${seriesName} · T${episode.season} E${episode.episode}` : seriesName
  const topNavTitle = episode ? `Episódios - ${seriesName}` : 'Sessões'

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
                  onClick={() => session.onClick?.()}
                />
              ))}
            </div>
          ) : (
            <p className="episode-detail-sessions-empty">Nenhuma sessão ainda</p>
          )}
          <Button variant="outline" fullWidth leadingIcon={<Add />} onClick={onAddSession}>
            Vincular sessão
          </Button>
        </div>
      </div>
    </main>
  )
}

export default EpisodeDetail
