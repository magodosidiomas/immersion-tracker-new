import { useEffect, useRef, useState } from 'react'
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
const SIZE = 180
const STROKE = 16
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Slices under this fraction still render at this minimum length —
// otherwise a 1-2% group is a sliver too thin to see or tap. Purely
// visual; the legend/percent always show the real number.
const MIN_ARC_FRACTION = 0.025

function DonutCard({ groups = [], centerLabel, title, description, bare = false, ...props }) {
  const [activeKey, setActiveKey] = useState(null)
  const cardRef = useRef(null)

  // Tapping/clicking anywhere outside the card clears the selection —
  // same expectation as a popover dismissing on an outside tap. Only
  // listens while a slice is actually selected, and skips capture so
  // the row/arc's own onClick (which does the toggling) runs first.
  useEffect(() => {
    if (!activeKey) return
    function handlePointerDown(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setActiveKey(null)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [activeKey])

  const sortedGroups = [...groups].sort((a, b) => b.totalSeconds - a.totalSeconds)

  const grandTotal = sortedGroups.reduce((sum, group) => sum + group.totalSeconds, 0)
  const pct = (seconds) => (grandTotal ? (seconds / grandTotal) * 100 : 0)

  // With nothing selected, the center shows the grand total (like a
  // subtotal line, not "this one category happens to be biggest") —
  // selecting a slice (click/tap, either on the ring or the legend
  // row) swaps it to that group's own label/time/percent.
  const active = centerLabel ?? sortedGroups.find((group) => group.key === activeKey)

  function toggle(key) {
    setActiveKey((current) => (current === key ? null : key))
  }

  // Cumulative offsets computed up front (not mutated during the map
  // below) — each arc's dash-offset is the sum of every prior arc's
  // (visual, floor-applied) length, keeping render side-effect-free.
  const arcs = sortedGroups.reduce((acc, group) => {
    const fraction = pct(group.totalSeconds) / 100
    const visualFraction = fraction > 0 ? Math.max(fraction, MIN_ARC_FRACTION) : 0
    const length = visualFraction * CIRCUMFERENCE
    const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].length : 0
    return [...acc, { group, length, offset }]
  }, [])

  return (
    <div ref={cardRef} className={`donut-card${bare ? ' donut-card-bare' : ''}`} {...props}>
      {title && (
        <div className="donut-card-header">
          <p className="donut-card-title">{title}</p>
          {description && <p className="donut-card-description">{description}</p>}
        </div>
      )}
      <div className="donut-card-ring-wrap">
        <svg
          className="donut-card-ring"
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          {grandTotal === 0 ? (
            <circle
              className="donut-card-arc donut-card-arc-empty"
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
            />
          ) : (
            arcs.map(({ group, length, offset }) => {
              const ramp = CHART_COLORS[group.colorRamp] ?? []
              const dimmed = activeKey && group.key !== activeKey
              return (
                <circle
                  key={group.key}
                  className="donut-card-arc"
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={ramp[group.rampIndex ?? 0]}
                  strokeWidth={STROKE}
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-offset}
                  style={{ opacity: dimmed ? 0.35 : 1 }}
                  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setActiveKey(group.key)}
                  onPointerLeave={(e) => e.pointerType === 'mouse' && setActiveKey(null)}
                  onClick={() => toggle(group.key)}
                />
              )
            })
          )}
        </svg>
        <div className="donut-card-center">
          {active ? (
            <>
              <span className="donut-card-center-label">{active.label}</span>
              <span className="donut-card-center-time">
                {formatDurationShort(active.totalSeconds)} · {Math.round(pct(active.totalSeconds))}%
              </span>
            </>
          ) : (
            <>
              <span className="donut-card-center-label">{formatDurationShort(grandTotal)}</span>
              <span className="donut-card-center-time">Total</span>
            </>
          )}
        </div>
      </div>

      <div className="donut-card-legend">
        {sortedGroups.map((group) => {
          const ramp = CHART_COLORS[group.colorRamp] ?? []
          const isActive = group.key === activeKey
          return (
            <button
              type="button"
              className="donut-card-legend-row"
              data-active={isActive}
              key={group.key}
              onClick={() => toggle(group.key)}
            >
              <span className="donut-card-legend-label">
                <span
                  className="donut-card-dot"
                  style={{ backgroundColor: ramp[group.rampIndex ?? 0] }}
                />
                <span className="donut-card-legend-text">
                  <span className="donut-card-legend-name">{group.label}</span>
                  {group.description && (
                    <span className="donut-card-legend-description">{group.description}</span>
                  )}
                </span>
              </span>
              <span className="donut-card-legend-meta">
                <span className="donut-card-legend-time">
                  {formatDurationShort(group.totalSeconds)}
                </span>
                <span className="donut-card-legend-percent">
                  {Math.round(pct(group.totalSeconds))}%
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DonutCard
