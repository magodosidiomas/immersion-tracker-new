import { useState } from 'react'
import './Calendar.css'
import CalendarItem from './CalendarItem'
import { getCalendarWeeks } from '../utils/date'
import { ChevronLeft, ChevronRight } from '@nine-thirty-five/material-symbols-react/outlined'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Thu', 'Fri', 'Sa', 'Su']
const MONTH_LABELS_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// Mirrors the Figma "calendar" component, but the header is a
// prev/next stepper instead of Figma's two dropdowns — Option B from
// the nav exploration, chosen over dropdown+bottomsheet as the
// everyday interaction. A tap-the-label sheet for jumping further was
// discussed too but is deliberately not built yet (arrows only for
// now).
//
// Stepping means Calendar now has to own which month it's showing, so
// the prop surface is sessionDates (raw Session.date strings) instead
// of a precomputed weeks grid — the same shape Home.jsx already builds
// (sessions.map(s => s.date)), passed straight through. Calendar does
// the getCalendarWeeks call itself, recomputed each time the viewed
// month changes.
function Calendar({ sessionDates = [], initialDate, ...props }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(initialDate ?? today)
  const month = viewDate.getMonth()
  const year = viewDate.getFullYear()
  const weeks = getCalendarWeeks(sessionDates, today, year, month)

  // Always step from day 1 so e.g. Jan 31 -> Feb doesn't get pulled
  // into March by JS Date's day-overflow rollover.
  function stepMonth(direction) {
    setViewDate(new Date(year, month + direction, 1))
  }

  return (
    <div className="calendar" {...props}>
      <div className="calendar-nav">
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => stepMonth(-1)}
          aria-label="Mês anterior"
        >
          <ChevronLeft />
        </button>
        <span className="calendar-nav-label">
          {MONTH_LABELS_FULL[month]} {year}
        </span>
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => stepMonth(1)}
          aria-label="Próximo mês"
        >
          <ChevronRight />
        </button>
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
