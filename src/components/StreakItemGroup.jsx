import StreakItem from './StreakItem'
import './StreakItemGroup.css'

// Mirrors the Figma "streakItemGroup" component — a row of streakItem
// instances. The Figma instance only documents the 7-day default look
// (all off, no isToday), so days is the one prop: an array of
// { weekday, isActive, isToday } passed straight through to each
// StreakItem. No date logic here yet — this is just the visual
// component per "por enquanto criar apenas como componente".
const defaultDays = [
  { weekday: 'S', isActive: false, isToday: false },
  { weekday: 'T', isActive: false, isToday: false },
  { weekday: 'Q', isActive: false, isToday: false },
  { weekday: 'Q', isActive: false, isToday: false },
  { weekday: 'S', isActive: false, isToday: false },
  { weekday: 'S', isActive: false, isToday: false },
  { weekday: 'D', isActive: false, isToday: false },
]

function StreakItemGroup({ days = defaultDays, ...props }) {
  return (
    <div className="streak-item-group" {...props}>
      {days.map((day, index) => (
        <StreakItem key={index} {...day} />
      ))}
    </div>
  )
}

export default StreakItemGroup
