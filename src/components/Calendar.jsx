import './Calendar.css'
import Dropdown from './Dropdown'
import CalendarItem from './CalendarItem'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Thu', 'Fri', 'Sa', 'Su']

// Figma's own mockup month, not date-accurate (Feb 2022 only has 28
// days) — illustrative sample data only, same spirit as
// StreakItemGroup's defaultDays. Gets replaced once real date/session
// logic decides what weeks/states to pass in.
const DEFAULT_WEEKS = [
  [{ day: 31, state: 'disabled' }, { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 }],
  [{ day: 7 }, { day: 8, state: 'active' }, { day: 9, state: 'active' }, { day: 10 }, { day: 11, state: 'active' }, { day: 12 }, { day: 13, state: 'active' }],
  [{ day: 14 }, { day: 15 }, { day: 16, state: 'active' }, { day: 17, state: 'active' }, { day: 18, state: 'today' }, { day: 19 }, { day: 20 }],
  [{ day: 21, state: 'active' }, { day: 22, state: 'active' }, { day: 23, state: 'active' }, { day: 24, state: 'active' }, { day: 25, state: 'active' }, { day: 26, state: 'active' }, { day: 27, state: 'active' }],
  [{ day: 28 }, { day: 29 }, { day: 30 }, { day: 31 }, { day: 1 }, { day: 2 }, { day: 3 }],
]

// Mirrors the Figma "calendar" component. The two header dropdowns are
// the month/year nav — Figma marks both hasSelection=true, so they use
// Dropdown's `selected` look. They're placeholders for now (no menu,
// just the onClick passthrough); real prev/next-month behavior isn't
// decided yet.
//
// Weekday letters reuse calendarItem's instance in Figma, but aren't
// made CalendarItem here — same reasoning as StreakItem choosing a div
// over a button: a label isn't an interactive control.
function Calendar({
  monthLabel = 'Fevereiro',
  yearLabel = '2022',
  weeks = DEFAULT_WEEKS,
  onMonthClick,
  onYearClick,
  ...props
}) {
  return (
    <div className="calendar" {...props}>
      <div className="calendar-nav">
        <Dropdown label={monthLabel} selected onClick={onMonthClick} />
        <Dropdown label={yearLabel} selected onClick={onYearClick} />
      </div>
      <div className="calendar-grid">
        <div className="calendar-row calendar-weekdays">
          {WEEKDAYS.map((weekday, index) => (
            <span key={index} className="calendar-weekday">
              {weekday}
            </span>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div className="calendar-row" key={weekIndex}>
            {week.map((cell, dayIndex) => (
              <CalendarItem key={dayIndex} day={cell.day} state={cell.state || 'default'} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Calendar
