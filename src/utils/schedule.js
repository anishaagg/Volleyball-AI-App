export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/** Display label for event time: "All day" when allDay or no time, otherwise formatted time */
export function getEventTimeLabel(event) {
  return (event.allDay || !event.time) ? 'All day' : formatTime(event.time)
}

export function sortByDate(events) {
  return [...events].sort((a, b) => {
    const d = (e) => (e.date || '').replace(/-/g, '')
    const t = (e) => (e.time || '00:00').replace(':', '')
    return (d(a) + t(a)).localeCompare(d(b) + t(b))
  })
}

/** Events that fall on a given date (single-day or multi-day that includes this date) */
export function eventsOnDate(events, dateStr) {
  const d = dateStr.replace(/-/g, '')
  return events.filter((e) => {
    const start = (e.date || '').replace(/-/g, '')
    const end = (e.endDate || e.date || '').replace(/-/g, '')
    return d >= start && d <= end
  })
}

/** Calendar grid for a month: { dateStr, date, isCurrentMonth, isToday }[] */
export function getCalendarDays(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = first.getDay()
  const daysInMonth = last.getDate()
  const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7
  const today = new Date()
  const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')
  const out = []

  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - startPad
    let dateStr, date, isCurrentMonth
    if (dayOffset < 0) {
      const d = new Date(year, month, dayOffset + 1)
      date = d
      dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
      isCurrentMonth = false
    } else if (dayOffset >= daysInMonth) {
      const d = new Date(year, month, dayOffset + 1)
      date = d
      dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
      isCurrentMonth = false
    } else {
      date = new Date(year, month, dayOffset + 1)
      dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(dayOffset + 1).padStart(2, '0')
      isCurrentMonth = true
    }
    out.push({
      dateStr,
      date,
      isCurrentMonth,
      isToday: dateStr === todayStr,
    })
  }
  return out
}
