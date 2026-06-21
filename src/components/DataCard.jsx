import { useState } from 'react'
import { KeyboardArrowDown } from '@nine-thirty-five/material-symbols-react/outlined'
import { CHART_COLORS } from '../data/chartColors'
import { formatDurationShort } from '../utils/sessions'
import './DataCard.css'

// Mirrors the Figma "[TEMPLATE] dataCard" component — a stack of
// expandable groups, each with a total + percent-of-grand-total bar,
// and (optionally) nested items using the same bar/percent treatment
// at progressively lighter steps of the group's color ramp.
//
// Deliberately generic (groups/items, not categories/subcategories) —
// the card doesn't know it's being fed immersion categories, so it
// can be reused later for other data-vis breakdowns (e.g. "Por
// habilidade") just by passing a differently-sourced groups array.
//
// Percentages are always relative to the grand total across all
// groups, not to each group's own total — every bar in the card sits
// on the same scale, so two equal-width bars always represent equal
// time, expanded or not. See imerso-data-model notes on this.
//
// Expand state lives inside the component (which group keys are
// open) — same precedent as Calendar owning its own viewDate/mode.
// It's a display toggle the rest of the app has no reason to know
// about. Groups expand independently, not as a single-open accordion.
function DataCard({ groups = [], ...props }) {
  const [expanded, setExpanded] = useState(() => new Set())

  function toggle(key) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const grandTotal = groups.reduce((sum, group) => sum + group.totalSeconds, 0)
  const pct = (seconds) => (grandTotal ? Math.round((seconds / grandTotal) * 100) : 0)

  return (
    <div className="data-card" {...props}>
      {groups.map((group) => {
        const ramp = CHART_COLORS[group.colorRamp] ?? []
        const hasItems = group.items?.length > 0
        const isOpen = expanded.has(group.key)
        const Row = hasItems ? 'button' : 'div'
        const rowProps = hasItems
          ? { type: 'button', onClick: () => toggle(group.key), 'aria-expanded': isOpen }
          : {}

        return (
          <div className="data-card-group" key={group.key}>
            <Row className="data-card-row" {...rowProps}>
              <span className="data-card-label">{group.label}</span>
              <span className="data-card-meta">
                <span className="data-card-time">{formatDurationShort(group.totalSeconds)}</span>
                <span className="data-card-percent">{pct(group.totalSeconds)}%</span>
                {hasItems && (
                  <span className="data-card-chevron" data-open={isOpen}>
                    <KeyboardArrowDown />
                  </span>
                )}
              </span>
            </Row>
            <div className="data-card-bar">
              <div
                className="data-card-bar-fill"
                style={{ width: `${pct(group.totalSeconds)}%`, backgroundColor: ramp[0] }}
              />
            </div>

            {hasItems && isOpen && (
              <div className="data-card-items">
                {group.items.map((item, index) => (
                  <div className="data-card-item" key={item.key}>
                    <div className="data-card-row data-card-row-nested">
                      <span className="data-card-label">{item.label}</span>
                      <span className="data-card-meta">
                        <span className="data-card-time">{formatDurationShort(item.totalSeconds)}</span>
                        <span className="data-card-percent">{pct(item.totalSeconds)}%</span>
                      </span>
                    </div>
                    <div className="data-card-bar data-card-bar-nested">
                      <div
                        className="data-card-bar-fill"
                        style={{
                          width: `${pct(item.totalSeconds)}%`,
                          backgroundColor: ramp[index + 1] ?? ramp[0],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default DataCard
