import { CHART_COLORS } from '../data/chartColors'
import { formatDurationShort } from '../utils/sessions'
import './DonutCard.css'

// Mirrors the Figma "Visão geral" donut — a ring built from one arc per
// group (stroke-dasharray on stacked <circle> elements) plus a legend
// below, no expand/collapse. Deliberately generic (groups, not
// categories) so it can be reused later for other donut breakdowns
// (e.g. a category's own subcategories) by passing a different array.
//
// Percentages are relative to the grand total across all groups —
// same convention as DataCard, so a donut and a bar view of the same
// data always agree.
const SIZE = 160
const STROKE = 18
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function DonutCard({ groups = [], centerLabel, ...props }) {
  const grandTotal = groups.reduce((sum, group) => sum + group.totalSeconds, 0)
  const pct = (seconds) => (grandTotal ? (seconds / grandTotal) * 100 : 0)

  const top = groups.reduce(
    (best, group) => (group.totalSeconds > (best?.totalSeconds ?? -1) ? group : best),
    null,
  )
  const label = centerLabel?.label ?? top?.label ?? '—'
  const time = centerLabel?.totalSeconds ?? top?.totalSeconds ?? 0

  // Cumulative offsets computed up front (not mutated during the map
  // below) — each arc's dash-offset is the sum of every prior arc's
  // length, keeping render side-effect-free.
  let cumulative = 0
  const arcs = groups.map((group) => {
    const fraction = pct(group.totalSeconds) / 100
    const length = fraction * CIRCUMFERENCE
    const arc = { group, length, offset: cumulative }
    cumulative += length
    return arc
  })

  return (
    <div className="donut-card" {...props}>
      <div className="donut-card-ring-wrap">
        <svg
          className="donut-card-ring"
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          {arcs.map(({ group, length, offset }) => {
            const ramp = CHART_COLORS[group.colorRamp] ?? []
            return (
              <circle
                key={group.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={ramp[0]}
                strokeWidth={STROKE}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
            )
          })}
        </svg>
        <div className="donut-card-center">
          <span className="donut-card-center-label">{label}</span>
          <span className="donut-card-center-time">{formatDurationShort(time)}</span>
        </div>
      </div>

      <div className="donut-card-legend">
        {groups.map((group) => {
          const ramp = CHART_COLORS[group.colorRamp] ?? []
          return (
            <div className="donut-card-legend-row" key={group.key}>
              <span className="donut-card-legend-label">
                <span className="donut-card-dot" style={{ backgroundColor: ramp[0] }} />
                {group.label}
              </span>
              <span className="donut-card-legend-meta">
                <span className="donut-card-legend-percent">
                  {Math.round(pct(group.totalSeconds))}%
                </span>
                <span className="donut-card-legend-time">
                  {formatDurationShort(group.totalSeconds)}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DonutCard
