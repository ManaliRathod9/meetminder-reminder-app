// IMPORTANT: "YYYY-MM-DD" strings passed to `new Date()` are parsed as UTC
// midnight, which shows as the previous day for US timezones. We always build
// local-time Dates from split parts to avoid this.

/** Parse a "YYYY-MM-DD" date string into a local-time Date at midnight. */
function localDateFromStr(dateStr) {
  if (!dateStr) return null
  const parts = dateStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  return new Date(parts[0], parts[1] - 1, parts[2]) // local midnight
}

/** Build a full local Date from a date string + optional "HH:MM" time string. */
export function parseReminderDate(dateStr, timeStr) {
  const base = localDateFromStr(dateStr)
  if (!base) return null
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number)
    if (!isNaN(h) && !isNaN(m)) {
      base.setHours(h, m, 0, 0)
    }
  }
  return base
}

export function isTodayDate(dateStr) {
  if (!dateStr) return false
  const d = localDateFromStr(dateStr)
  if (!d) return false
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

export function isTomorrowDate(dateStr) {
  if (!dateStr) return false
  const d = localDateFromStr(dateStr)
  if (!d) return false
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  )
}

export function isThisWeekDate(dateStr) {
  if (!dateStr) return false
  const d = localDateFromStr(dateStr)
  if (!d) return false
  const now = new Date()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  return d >= startOfWeek && d <= endOfWeek
}

export function isThisMonthDate(dateStr) {
  if (!dateStr) return false
  const d = localDateFromStr(dateStr)
  if (!d) return false
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

/** Returns true if the reminder date+time has already passed. */
export function isPastDateTime(dateStr, timeStr) {
  const dt = parseReminderDate(dateStr, timeStr)
  if (!dt) return false
  return dt < new Date()
}

/** "Sat, May 24, 2026" */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = localDateFromStr(dateStr)
  if (!d) return dateStr
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** "3:30 PM" */
export function formatTime(timeStr) {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return timeStr
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

/** How many minutes until the reminder fires (negative = already passed). */
export function minutesUntil(dateStr, timeStr) {
  const dt = parseReminderDate(dateStr, timeStr)
  if (!dt) return null
  return Math.round((dt - new Date()) / 60000)
}

/** "Today", "Tomorrow", or the formatted date. */
export function getRelativeLabel(dateStr) {
  if (!dateStr) return ''
  if (isTodayDate(dateStr)) return 'Today'
  if (isTomorrowDate(dateStr)) return 'Tomorrow'
  return formatDate(dateStr)
}
