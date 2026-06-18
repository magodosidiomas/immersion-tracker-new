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
