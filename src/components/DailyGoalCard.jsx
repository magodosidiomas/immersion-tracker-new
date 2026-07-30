import { Flag, Check } from '@nine-thirty-five/material-symbols-react/outlined'
import { formatDurationShort } from '../utils/sessions'
import './DailyGoalCard.css'

const RADIUS = 20
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// "Meta diária" card on the home screen. Three states, chosen by whether a
// daily goal is set (goalMinutes is null/undefined until the person defines
// one in Settings > Meta diária) and, once set, whether today's total has
// reached it:
// - No goal: dashed ring + call-to-action, tapping opens the goal screen.
// - Goal set, in progress: filled progress ring (today's total vs the goal,
//   clamped to 100%) + "Xh Ym / goal".
// - Goal reached: ring swaps for a solid filled circle with a check, same
//   as StreakItem's isActive circle — reads as "done" at a glance instead
//   of a ring that's technically full but still looks like a ring.
// Tapping reopens the goal screen to edit it in all three states.
function DailyGoalCard({ goalMinutes, todaySeconds = 0, onClick }) {
  const hasGoal = Boolean(goalMinutes)
  const progress = hasGoal ? Math.min(todaySeconds / (goalMinutes * 60), 1) : 0
  const isComplete = hasGoal && progress >= 1
  const dashoffset = CIRCUMFERENCE * (1 - progress)

  return (
    <button type="button" className="daily-goal-card" onClick={onClick}>
      <div className="daily-goal-card-ring">
        {isComplete ? (
          <div className="daily-goal-card-ring-complete" aria-hidden="true">
            <Check />
          </div>
        ) : hasGoal ? (
          <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
            <circle className="daily-goal-card-ring-track" cx="24" cy="24" r={RADIUS} fill="none" strokeWidth="5" />
            <circle
              className="daily-goal-card-ring-progress"
              cx="24"
              cy="24"
              r={RADIUS}
              fill="none"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 24 24)"
            />
          </svg>
        ) : (
          <div className="daily-goal-card-ring-dashed" aria-hidden="true">
            <div className="daily-goal-card-ring-icon">
              <Flag />
            </div>
          </div>
        )}
      </div>
      {hasGoal ? (
        <div className="daily-goal-card-text">
          <span className="daily-goal-card-label">Meta diária</span>
          <span className="daily-goal-card-value">
            {formatDurationShort(todaySeconds)}
            <span className="daily-goal-card-goal"> / {formatDurationShort(goalMinutes * 60)}</span>
          </span>
        </div>
      ) : (
        <div className="daily-goal-card-text">
          <span className="daily-goal-card-label">Meta diária</span>
          <span className="daily-goal-card-cta">Definir meta diária</span>
        </div>
      )}
    </button>
  )
}

export default DailyGoalCard
