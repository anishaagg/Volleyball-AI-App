import { useState } from 'react'
import { getCalendarDays, eventsOnDate, getEventTimeLabel } from '../utils/schedule'
import styles from './ScheduleCalendar.module.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ScheduleCalendar({ events, onEditEvent, onDeleteEvent, canEdit }) {
  const [viewDate, setViewDate] = useState(() => new Date())
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const days = getCalendarDays(year, month)

  const goPrev = () => setViewDate(new Date(year, month - 1, 1))
  const goNext = () => setViewDate(new Date(year, month + 1, 1))
  const goToday = () => setViewDate(new Date())

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button type="button" onClick={goPrev} className={styles.navBtn} aria-label="Previous month">
          ‹
        </button>
        <h2 className={styles.monthTitle}>
          <button type="button" onClick={goToday} className={styles.monthLabel}>
            {monthLabel}
          </button>
        </h2>
        <button type="button" onClick={goNext} className={styles.navBtn} aria-label="Next month">
          ›
        </button>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <div key={d} className={styles.weekday}>{d}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {days.map(({ dateStr, date, isCurrentMonth, isToday }) => {
          const dayEvents = eventsOnDate(events, dateStr)
          return (
            <div
              key={dateStr}
              className={`${styles.day} ${!isCurrentMonth ? styles.dayOther : ''} ${isToday ? styles.dayToday : ''}`}
            >
              <span className={styles.dayNum}>{date.getDate()}</span>
              <div className={styles.dayEvents}>
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={styles.eventPill}
                    data-type={event.type}
                    title={event.title}
                  >
                    <span className={styles.eventPillTitle}>{event.title}</span>
                    <span className={styles.eventPillTime}>{getEventTimeLabel(event)}</span>
                    {canEdit && (
                      <span className={styles.eventPillActions}>
                        <button
                          type="button"
                          onClick={() => onEditEvent(event)}
                          className={styles.eventPillBtn}
                          title="Update"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEvent(event.id)}
                          className={styles.eventPillBtnDanger}
                          title="Delete"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
