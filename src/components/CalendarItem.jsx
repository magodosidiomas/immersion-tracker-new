import './CalendarItem.css'

// Mirrors the Figma "calendarItem" component set. `state` covers every
// documented value except hover: hover only ever lightens the active
// (selected/purple) fill, same idea as SegmentedButton's selected+hover
// pairing, so it's plain CSS instead of a prop value. "mounth" (Figma's
// typo) is spelled "month" here. The two white-version-* values are a
// light-on-dark treatment Figma documents for this component but that
// isn't used by the calendar itself yet — kept for parity with the set.
function CalendarItem({ day = 1, state = 'default', ...props }) {
  return (
    <button type="button" className="calendar-item" data-state={state} {...props}>
      {day}
    </button>
  )
}

export default CalendarItem
