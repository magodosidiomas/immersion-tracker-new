import { useMemo, useState } from 'react'
import './Calendar.css'
import CalendarItem from './CalendarItem'
import Dropdown from './Dropdown'
import SelectionChip from './SelectionChip'
import { getCalendarWeeks, formatDateInput, MONTH_LABELS_FULL } from '../utils/date'
import { ChevronLeft, ChevronRight } from '@nine-thirty-five/material-symbols-react/outlined'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Thu', 'Fri', 'Sa', 'Su']

// Mirrors the Figma "calendar" component set (color: default|light,
// type: date-picker|month). type isn't a prop — it's internal state
// (`mode`), the same way which month is showing already lives in
// `viewDate` instead of being passed in. color stays a real prop:
// it's about where the calendar is placed (its own surface vs. an
// already-elevated one like a BottomSheet), not something the
// calendar decides on its own.
//
// Tapping the month/year label opens the year picker — reusing
// Dropdown as-is for that label+chevron (not a new component; same
// transparent-background, hover-pill shape Figma's "dateSwitcher"
// exploration landed on) and SelectionChip per year with both icon
// slots hidden (Figma's chips here are plain numbers, not the
// dated/checked variant). Picking a year jumps straight back to the
// month grid for that year — no separate confirm step, and no arrows
// in this mode (hasNavigationArrow=false) since there's no month to
// step through yet.
//
// Stepping means Calendar now has to own which month it's showing, so
// the prop surface is sessionDates (raw Session.date strings) instead
// of a precomputed weeks grid — the same shape Home.jsx already builds
// (sessions.map(s => s.date)), passed straight through. Calendar does
// the getCalendarWeeks call itself, recomputed each time the viewed
// month changes.
//
// onSelectDay reports the tapped cell as a 'YYYY-MM-DD' string (same
// shape as sessionDates), not a Date — every consumer so far only
// needs it for comparing against/storing as Session.date. Boundary
// cells (previous/next month, state 'disabled') are real
// disabled={true} buttons already, so they never reach this handler.
function Calendar({ sessionDates = [], initialDate, onSelectDay, color = 'default', ...props }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(initialDate ?? today)
  const [mode, setMode] = useState('month')
  const month = viewDate.getMonth()
  const year = viewDate.getFullYear()
  const weeks = getCalendarWeeks(sessionDates, today, year, month)

  // Always step from day 1 so e.g. Jan 31 -> Feb doesn't get pulled
  // into March by JS Date's day-overflow rollover.
  function stepMonth(direction) {
    setViewDate(new Date(year, month + direction, 1))
  }

  function selectYear(selectedYear) {
    setViewDate(new Date(selectedYear, month, 1))
    setMode('month')
  }

  // Floor of 6 years back so the picker never shrinks to a single
  // useless chip for a brand-new account; grows further back on its
  // own once real session history goes past that — no separate query
  // needed since sessionDates already carries full per-language
  // history (the same prop Calendar already gets for the active-day
  // marks), so the earliest year is just read off it.
  const years = useMemo(() => {
    const currentYear = today.getFullYear()
    const earliestSessionYear = sessionDates.reduce(
      (min, date) => Math.min(min, Number(date.slice(0, 4))),
      currentYear
    )
    const startYear = Math.min(currentYear - 6, earliestSessionYear)
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionDates])

  return (
    <div className="calendar" data-color={color} {...props}>
      <div className="calendar-nav">
        <Dropdown
          label={`${MONTH_LABELS_FULL[month]} ${year}`}
          onClick={() => setMode(mode === 'month' ? 'date-picker' : 'month')}
        />
        {mode === 'month' && (
          <div className="calendar-nav-arrows">
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={() => stepMonth(-1)}
              aria-label="Mês anterior"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={() => stepMonth(1)}
              aria-label="Próximo mês"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
      {mode === 'month' ? (
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
                <CalendarItem
                  key={dayIndex}
                  day={cell.day}
                  state={cell.state || 'default'}
                  disabled={cell.disabled}
                  onClick={() => onSelectDay?.(formatDateInput(new Date(year, month, cell.day)))}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="calendar-year-picker">
          <p className="calendar-year-picker-label">Ano</p>
          <div className="calendar-year-picker-grid">
            {years.map((y) => (
              <SelectionChip
                key={y}
                label={String(y)}
                selected={y === year}
                hasLeadingIcon={false}
                hasTrailingIcon={false}
                onClick={() => selectYear(y)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
