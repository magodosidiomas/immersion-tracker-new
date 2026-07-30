import { Flag } from '@nine-thirty-five/material-symbols-react/outlined'
import './MetasCard.css'

// Mirrors the updated Figma "Metas" card — level header, a "current /
// target" big-number ratio, a single-fill progress bar (no ticks), and
// a caption highlighting how much is left to the current goal.
//
// Deliberately generic: the card only knows level/current/target/
// progress, not how milestones are calculated — that logic lives with
// whoever computes those values (see imerso-data-model notes on the
// level formula).
function MetasCard({
  level,
  current,
  target,
  progress = 0,
  remaining,
  remainingCaption,
  ...props
}) {
  return (
    <div className="metas-card" {...props}>
      <div className="metas-card-top">
        <span className="metas-card-flag">
          <Flag />
        </span>
        <span className="metas-card-title">Metas</span>
        <span className="metas-card-dot">•</span>
        <span className="metas-card-level">Nível {level}</span>
      </div>

      <div className="metas-card-body">
        <div className="metas-card-hero">
          <span className="metas-card-hero-current">{current}</span>
          <span className="metas-card-hero-target"> / {target}</span>
        </div>

        <div className="metas-card-progress">
          <div className="metas-card-track">
            <div
              className="metas-card-fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="metas-card-caption">
            <span className="metas-card-caption-accent">{remaining}</span>
            {remainingCaption && ` ${remainingCaption}`}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MetasCard
