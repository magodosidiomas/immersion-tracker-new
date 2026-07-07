import TopNav from '../components/TopNav'
import ListItem from '../components/ListItem'
import Button from '../components/Button'
import { ArrowBack, Add, ChevronRight } from '@nine-thirty-five/material-symbols-react/outlined'
import './EpisodeDetail.css'

// Opened from the pencil icon on an episode row in ManageEpisodes.
// Only owns sessão-linking — there's no name to edit here (the title
// is the same auto-generated "Série · T# E#" shown in the form),
// mirrors ContentForm's "Sessões vinculadas" card/empty-state exactly.
function EpisodeDetail({ seriesName = '', episode, linkedSessions = [], onAddSession, onBack }) {
  const title = `${seriesName} · T${episode?.season} E${episode?.episode}`

  return (
    <main className="episode-detail">
      <TopNav
        title={`Episódios - ${seriesName}`}
        hasDivider
        leadingIcon={
          <button type="button" className="top-nav-icon-reset" onClick={onBack} aria-label="Voltar">
            <ArrowBack />
          </button>
        }
      />
      <div className="episode-detail-content">
        <h2 className="episode-detail-title">{title}</h2>

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
