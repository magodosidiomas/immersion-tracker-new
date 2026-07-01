import { useState } from "react";
import { CHART_COLORS } from "../data/chartColors";
import { formatDurationShort } from "../utils/sessions";
import "./DonutCard.css";

// Mirrors the Figma "Visão geral" donut — a ring built from one arc per
// group (stroke-dasharray on stacked <circle> elements) plus a legend
// below, no expand/collapse. Deliberately generic (groups, not
// categories) so it can be reused later for other donut breakdowns
// (e.g. a category's own subcategories) by passing a different array.
//
// Percentages are relative to the grand total across all groups —
// same convention as DataCard, so a donut and a bar view of the same
// data always agree.
const SIZE = 220;
const STROKE = 20;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Slices under this fraction still render at this minimum length —
// otherwise a 1-2% group is a sliver too thin to see or tap. Purely
// visual; the legend/percent always show the real number.
const MIN_ARC_FRACTION = 0.025;

function DonutCard({
  groups = [],
  centerLabel,
  title,
  bare = false,
  ...props
}) {
  const [activeKey, setActiveKey] = useState(null);

  const sortedGroups = [...groups].sort(
    (a, b) => b.totalSeconds - a.totalSeconds,
  );

  const grandTotal = sortedGroups.reduce(
    (sum, group) => sum + group.totalSeconds,
    0,
  );
  const pct = (seconds) => (grandTotal ? (seconds / grandTotal) * 100 : 0);

  const top = sortedGroups[0] ?? null;
  const active = sortedGroups.find((group) => group.key === activeKey);
  const displayed = centerLabel ?? active ?? top;
  const label = displayed?.label ?? "—";
  const time = displayed?.totalSeconds ?? 0;

  // Cumulative offsets computed up front (not mutated during the map
  // below) — each arc's dash-offset is the sum of every prior arc's
  // (visual, floor-applied) length, keeping render side-effect-free.
  const arcs = sortedGroups.reduce((acc, group) => {
    const fraction = pct(group.totalSeconds) / 100;
    const visualFraction =
      fraction > 0 ? Math.max(fraction, MIN_ARC_FRACTION) : 0;
    const length = visualFraction * CIRCUMFERENCE;
    const offset = acc.length
      ? acc[acc.length - 1].offset + acc[acc.length - 1].length
      : 0;
    return [...acc, { group, length, offset }];
  }, []);

  return (
    <div className="donut-card-group">
      {title && <p className="donut-card-title">{title}</p>}
      <div className={`donut-card${bare ? " donut-card-bare" : ""}`} {...props}>
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
                const ramp = CHART_COLORS[group.colorRamp] ?? [];
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
                    transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                    onPointerEnter={(e) =>
                      e.pointerType === "mouse" && setActiveKey(group.key)
                    }
                    onPointerLeave={(e) =>
                      e.pointerType === "mouse" && setActiveKey(null)
                    }
                    onClick={() =>
                      setActiveKey((current) =>
                        current === group.key ? null : group.key,
                      )
                    }
                  />
                );
              })
            )}
          </svg>
          <div className="donut-card-center">
            <span className="donut-card-center-label">{label}</span>
            <span className="donut-card-center-time">
              {formatDurationShort(time)}
            </span>
          </div>
        </div>

        <div className="donut-card-legend">
          {sortedGroups.map((group) => {
            const ramp = CHART_COLORS[group.colorRamp] ?? [];
            return (
              <div className="donut-card-legend-row" key={group.key}>
                <span className="donut-card-legend-label">
                  <span
                    className="donut-card-dot"
                    style={{ backgroundColor: ramp[group.rampIndex ?? 0] }}
                  />
                  {group.label}
                </span>
                <span className="donut-card-legend-meta">
                  <span className="donut-card-legend-time">
                    {formatDurationShort(group.totalSeconds)}
                  </span>
                  <span className="donut-card-legend-percent">
                    {Math.round(pct(group.totalSeconds))}%
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DonutCard;
