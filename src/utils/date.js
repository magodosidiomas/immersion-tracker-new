export function pad2(n) {
  return String(n).padStart(2, '0')
}

// 'YYYY-MM-DD' in local time — matches the <input type="date"> format
// and is what Session.date is stored as. Local (not UTC) so a session
// logged late at night still lands on the calendar day it actually
// happened on.
export function formatDateInput(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

// "1:32:14" past an hour, "32:14" under it — shared by the timer
// screen's big readout and TimerWidget's compact one, so both always
// agree on formatting.
export function formatElapsed(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`
}

// Monday of the week containing `date`, as a Date — the shared base
// both getWeekRange and getStreakWeekDays build their week off of.
function startOfWeek(date) {
  const day = date.getDay() // 0 (Sun) .. 6 (Sat)
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + mondayOffset)
  return monday
}

// Monday-start week (matches the streak row's Seg–Dom order), as
// 'YYYY-MM-DD' bounds inclusive of both ends — comparable directly
// against Session.date strings without parsing them back into Dates.
export function getWeekRange(date) {
  const monday = startOfWeek(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: formatDateInput(monday), end: formatDateInput(sunday) }
}

const STREAK_WEEKDAY_LETTERS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] // Seg..Dom

// Mon–Sun row for StreakItemGroup: weekday letter, whether a session
// landed on that day, and whether it's today. sessionDates is every
// Session.date for the active language — duplicates are fine, only
// presence per day matters.
export function getStreakWeekDays(sessionDates, today) {
  const dates = new Set(sessionDates)
  const todayStr = formatDateInput(today)
  const monday = startOfWeek(today)
  return STREAK_WEEKDAY_LETTERS.map((weekday, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)
    const dateStr = formatDateInput(day)
    return { weekday, isActive: dates.has(dateStr), isToday: dateStr === todayStr }
  })
}

// Consecutive days with a session, ending today and walking backwards.
// If today has no session yet, today isn't "missed" — the day just
// isn't over — so counting starts from yesterday instead of reading
// as a broken streak mid-day.
export function calculateStreak(sessionDates, today) {
  const dates = new Set(sessionDates)
  const cursor = new Date(today)
  if (!dates.has(formatDateInput(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  let streak = 0
  while (dates.has(formatDateInput(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
