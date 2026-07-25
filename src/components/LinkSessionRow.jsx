import './LinkSessionRow.css'
import { Add } from '@nine-thirty-five/material-symbols-react/outlined'

// Empty-state prompt for "no sessions linked yet" — dashed outline row
// (not a filled/primary CTA) so it reads as an empty slot waiting to
// be filled, not the main action of the screen. Replaces the old
// EmptyState (icon+title+description+button) for this specific case,
// which took up too much vertical space and buried the prompt in copy.
// Used by both ContentForm (novo conteúdo) and EpisodeDetail (episódio/
// filme session view) — same row for every content type.
function LinkSessionRow({ label = 'Vincular sessão', onClick }) {
  return (
    <button type="button" className="link-session-row" onClick={onClick}>
      <Add className="link-session-row-icon" />
      <span className="link-session-row-label">{label}</span>
    </button>
  )
}

export default LinkSessionRow
