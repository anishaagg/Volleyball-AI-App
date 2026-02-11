import { useState, useEffect } from 'react'
import styles from './EventForm.module.css'

const TYPES = ['game', 'practice', 'tournament']
const ALL_DAY_TYPES = ['game', 'tournament']

export default function EventForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('practice')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('16:00')
  const [allDay, setAllDay] = useState(false)
  const [endDate, setEndDate] = useState('')
  const [location, setLocation] = useState('')
  const [opponent, setOpponent] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '')
      setType(initial.type || 'practice')
      setDate(initial.date || '')
      setTime(initial.time || '16:00')
      setAllDay(Boolean(initial.allDay))
      setEndDate(initial.endDate || '')
      setLocation(initial.location || '')
      setOpponent(initial.opponent || '')
      setNotes(initial.notes || '')
    } else {
      const today = new Date().toISOString().slice(0, 10)
      setDate(today)
    }
  }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !date) return
    onSave({
      title: title.trim(),
      type,
      date,
      time: allDay ? undefined : (time || undefined),
      allDay: ALL_DAY_TYPES.includes(type) ? allDay : undefined,
      endDate: endDate || undefined,
      location: location.trim() || undefined,
      opponent: type === 'game' ? (opponent.trim() || undefined) : undefined,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.formTitle}>{initial ? 'Edit event' : 'New event'}</h3>

      <label className={styles.label}>
        Type
        <select value={type} onChange={(e) => setType(e.target.value)} className={styles.input}>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </label>

      <label className={styles.label}>
        Title *
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Evening Practice"
          className={styles.input}
          required
        />
      </label>

      <div className={styles.row}>
        <label className={styles.label}>
          Date *
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.input} required />
        </label>
        {!allDay && (
          <label className={styles.label}>
            Time
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={styles.input} />
          </label>
        )}
      </div>

      {ALL_DAY_TYPES.includes(type) && (
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className={styles.checkbox}
          />
          <span>All day</span>
        </label>
      )}

      {type === 'tournament' && (
        <label className={styles.label}>
          End date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={styles.input} />
        </label>
      )}

      <label className={styles.label}>
        Location
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Main Gym"
          className={styles.input}
        />
      </label>

      {type === 'game' && (
        <label className={styles.label}>
          Opponent
          <input
            type="text"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            placeholder="e.g. Westside Eagles"
            className={styles.input}
          />
        </label>
      )}

      <label className={styles.label}>
        Notes
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          className={styles.textarea}
          rows={2}
        />
      </label>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
        <button type="submit" className={styles.submitBtn}>Save</button>
      </div>
    </form>
  )
}
