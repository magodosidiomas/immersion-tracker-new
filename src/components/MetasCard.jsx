import { Flag } from '@nine-thirty-five/material-symbols-react/outlined'
import './MetasCard.css'

// Mirrors the updated Figma "Metas" card — level header, a "current /
// target" big-number ratio, a segmented progress bar, and a caption
// highlighting how much is left to the current goal.
//
// Segments are always 4 (25% quartiles) regardless of the level's hour
// range — decided over ticks tied to hour blocks or a variable count,
// since the gap between levels swings from ~2h to 250h+ and a fixed
// quartile split is the only treatment that reads consistently at
// every level.
//
// Deliberately generic: the card only knows level/current/target/
// progress, not how milestones are calculated — that logic lives with
// whoever computes those values (see imerso-data-model notes on the
// level formula).
const SEGMENTS = 4

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
            <div className="metas-card-ticks">
              {Array.from({ length: SEGMENTS }).map((_, index) => (
                <div className="metas-card-tick" key={index} />
              ))}
            </div>
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
