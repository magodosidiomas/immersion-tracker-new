import { Flag } from '@nine-thirty-five/material-symbols-react/outlined'
import './MetasCard.css'

// Mirrors the Figma "Metas" card — level header, hero value (time left
// to the next level) and a segmented progress bar between the current
// and next level's milestones.
//
// Deliberately generic: the card only knows level/value/progress/range,
// not how milestones are calculated. Level 16+ milestones come from a
// formula (see imerso-data-model notes), not a fixed table, but that
// logic lives with whoever computes `progress`/`rangeStart`/`rangeEnd`
// — the card just renders whatever range it's given.
function MetasCard({
  level,
  value,
  caption,
  progress = 0,
  segments = 4,
  rangeStart,
  rangeEnd,
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

      <div className="metas-card-hero">
        <span className="metas-card-hero-value">{value}</span>
        <span className="metas-card-hero-caption">{caption}</span>
      </div>

      <div className="metas-card-range">
        <div className="metas-card-track">
          <div className="metas-card-fill" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          <div className="metas-card-ticks">
            {Array.from({ length: segments }).map((_, index) => (
              <div className="metas-card-tick" key={index} />
            ))}
          </div>
        </div>
        <div className="metas-card-range-labels">
          <span>{rangeStart}</span>
          <span>{rangeEnd}</span>
        </div>
      </div>
    </div>
  )
}

export default MetasCard
