import StreakItemGroup from './StreakItemGroup'
import './StreakCard.css'

// Mirrors the Figma "streakCard" component — header (🔥 + title/value
// text) on top of a StreakItemGroup row. Visual component only for now,
// per "criar apenas como componente": no streak-count or date logic
// wired in yet, just composes the StreakItem/StreakItemGroup base built
// previously. title/value follow the same presence-toggle convention as
// NumericCard's title/number.
function StreakCard({ title = 'Sequência', value = '7 dias', days, ...props }) {
  return (
    <div className="streak-card" {...props}>
      <div className="streak-card-header">
        <span className="streak-card-emoji">🔥</span>
        <div className="streak-card-text">
          {title && <span className="streak-card-title">{title}</span>}
          {value && <span className="streak-card-value">{value}</span>}
        </div>
      </div>
      <StreakItemGroup days={days} />
    </div>
  )
}

export default StreakCard
