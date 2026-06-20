import './Calendar.css'
import Dropdown from './Dropdown'
import CalendarItem from './CalendarItem'
import { getCalendarWeeks } from '../utils/date'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Thu', 'Fri', 'Sa', 'Su']
const MONTH_LABELS_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// Mirrors the Figma "calendar" component. Defaults to today's real
// month with no marked days when used bare — month/year/weeks are all
// overridable for a caller that has real session data and a specific
// month to show.
//
// The two header dropdowns are the month/year nav — Figma marks both
// hasSelection=true, so they use Dropdown's `selected` look. They stay
// placeholders (onClick passthrough only, no menu): prev/next-month
// switching isn't decided yet, intentionally out of scope here.
//
// Weekday letters reuse calendarItem's instance in Figma, but aren't
// made CalendarItem here — same reasoning as StreakItem choosing a div
// over a button: a label isn't an interactive control.
function Calendar({ monthLabel, yearLabel, weeks, onMonthClick, onYearClick, ...props }) {
  const today = new Date()
  const resolvedMonthLabel = monthLabel ?? MONTH_LABELS_FULL[today.getMonth()]
  const resolvedYearLabel = yearLabel ?? String(today.getFullYear())
  const resolvedWeeks = weeks ?? getCalendarWeeks([], today, today.getFullYear(), today.getMonth())

  return (
    <div className="calendar" {...props}>
      <div className="calendar-nav">
        <Dropdown label={resolvedMonthLabel} selected onClick={onMonthClick} />
        <Dropdown label={resolvedYearLabel} selected onClick={onYearClick} />
      </div>
      <div className="calendar-grid">
        <div className="calendar-row calendar-weekdays">
          {WEEKDAYS.map((weekday, index) => (
            <span key={index} className="calendar-weekday">
              {weekday}
            </span>
          ))}
        </div>
        {resolvedWeeks.map((week, weekIndex) => (
          <div className="calendar-row" key={weekIndex}>
            {week.map((cell, dayIndex) => (
              <CalendarItem
                key={dayIndex}
                day={cell.day}
                state={cell.state || 'default'}
                disabled={cell.disabled}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Calendar
