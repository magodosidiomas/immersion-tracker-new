import './ResumeSessionBanner.css'

// Non-blocking banner shown on Home when a running/paused timer draft is
// found in IndexedDB after a reload ("Sessão rodando, iniciada há 2h —
// continuar ou descartar?"). Purely presentational for now — icon, copy
// and the two action buttons are all passed in by the parent, same
// primaryButton/secondaryButton slot pattern as BottomSheet — so it
// carries no resume/discard or draft-reading logic of its own yet.
function ResumeSessionBanner({ icon, title, description, primaryButton, secondaryButton }) {
  return (
    <div className="resume-session-banner">
      {icon && <span className="resume-session-banner-icon">{icon}</span>}
      <div className="resume-session-banner-text">
        <p className="resume-session-banner-title">{title}</p>
        <p className="resume-session-banner-description">{description}</p>
        <div className="resume-session-banner-actions">
          {secondaryButton}
          {primaryButton}
        </div>
      </div>
    </div>
  )
}

export default ResumeSessionBanner
