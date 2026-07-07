export function pad2(n) {
  return String(n).padStart(2, '0')
}

export const MONTH_LABELS_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// 'YYYY-MM-DD' in local time — matches the <input type="date"> format
// and is what Session.date is stored as. Local (not UTC) so a session
// logged late at night still lands on the calendar day it actually
// happened on.
export function formatDateInput(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

// Inverse of formatDateInput — local-time Date from a stored
// Session.date string. Splitting and constructing with (y, m-1, d)
// instead of `new Date(dateStr)` sidesteps that constructor's
// UTC-midnight parsing, which can land on the wrong local day.
export function parseDateInput(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// "18 de abril, 2026" — DayHistory's date-picker label.
export function formatFullDate(dateStr) {
  const date = parseDateInput(dateStr)
  return `${date.getDate()} de ${MONTH_LABELS_FULL[date.getMonth()].toLowerCase()}, ${date.getFullYear()}`
}

// "Hoje" / "Ontem" / "13/04" — day-group header shared by anything
// that buckets rows by calendar day (content lists, history). dateStr
// is always a stored 'YYYY-MM-DD'; compared as strings so there's no
// timezone drift from going through Date objects for the common cases.
export function formatGroupLabel(dateStr, todayStr) {
  if (dateStr === todayStr) return 'Hoje'
  const yesterday = parseDateInput(todayStr)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === formatDateInput(yesterday)) return 'Ontem'
  const [, month, day] = dateStr.split('-')
  return `${day}/${month}`
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

// Mon-start weeks covering `month` (0-11) of `year`, padded with
// trailing days of the previous month and leading days of the next so
// every week has 7 cells — the shape Calendar's `weeks` prop expects:
// rows of { day, state, disabled }. Boundary days use 'disabled',
// matching how the original Figma calendar instance styled them, and
// are flagged disabled:true so they're non-interactive, not just
// styled to look that way. sessionDates is every Session.date for
// whichever language the caller cares about, same input shape as
// getStreakWeekDays.
export function getCalendarWeeks(sessionDates, today, year, month) {
  const dates = new Set(sessionDates)
  const todayStr = formatDateInput(today)

  const firstWeekday = new Date(year, month, 1).getDay() // 0 (Sun) .. 6 (Sat)
  const leadingCount = firstWeekday === 0 ? 6 : firstWeekday - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const trailingCount = (7 - ((leadingCount + daysInMonth) % 7)) % 7

  const cells = []
  for (let i = leadingCount; i > 0; i--) {
    cells.push({ day: new Date(year, month, 1 - i).getDate(), state: 'disabled', disabled: true })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateInput(new Date(year, month, day))
    const state = dateStr === todayStr ? 'today' : dates.has(dateStr) ? 'active' : undefined
    cells.push({ day, state })
  }
  for (let day = 1; day <= trailingCount; day++) {
    cells.push({ day, state: 'disabled', disabled: true })
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}
