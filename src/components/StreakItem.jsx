import './StreakItem.css'
import { Check } from '@nine-thirty-five/material-symbols-react/outlined'

// Mirrors the Figma "streakItem" component set (isActive × isToday, 3
// variants — off/false is the base, on/false and off/true are the other
// two documented instances). Presentational only, like NumericCard: a
// plain div, not a button, since a single day in the streak isn't an
// interactive control.
function StreakItem({ weekday = 'S', isActive = false, isToday = false, ...props }) {
  return (
    <div className="streak-item" data-active={isActive} data-today={isToday} {...props}>
      <span className="streak-item-circle">{isActive && <Check />}</span>
      <span className="streak-item-label">{weekday}</span>
    </div>
  )
}

export default StreakItem
