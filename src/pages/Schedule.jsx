import { useState } from 'react'
import { useTeam } from '../context/TeamContext'
import { useAuth } from '../context/AuthContext'
import { formatDate, getEventTimeLabel, sortByDate } from '../utils/schedule'
import EventForm from '../components/EventForm'
import ScheduleCalendar from '../components/ScheduleCalendar'
import styles from './Schedule.module.css'

export default function Schedule() {
  const { schedule, dispatch } = useTeam()
  const { canManageTeam } = useAuth()
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('list') // 'list' | 'calendar'
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const filtered = filter === 'all'
    ? schedule
    : schedule.filter((e) => e.type === filter)
  const sorted = sortByDate(filtered)

  const handleSave = (data) => {
    if (editingId) {
      dispatch({ type: 'SCHEDULE_UPDATE', payload: { id: editingId, ...data } })
      setEditingId(null)
    } else {
      dispatch({ type: 'SCHEDULE_ADD', payload: data })
    }
    setShowForm(false)
  }

  const handleEdit = (event) => {
    setEditingId(event.id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Remove this event?')) dispatch({ type: 'SCHEDULE_REMOVE', payload: id })
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Schedule</h1>
        <p className={styles.subtitle}>Games, practices, and tournaments.</p>
        {canManageTeam && (
          <p className={styles.coachNote}>Add new events or update any event using the buttons below.</p>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.viewToggle}>
            <button
              type="button"
              className={view === 'list' ? styles.viewActive : styles.viewBtn}
              onClick={() => setView('list')}
            >
              List
            </button>
            <button
              type="button"
              className={view === 'calendar' ? styles.viewActive : styles.viewBtn}
              onClick={() => setView('calendar')}
            >
              Calendar
            </button>
          </div>
          <div className={styles.filters}>
            {['all', 'game', 'practice', 'tournament'].map((type) => (
              <button
                key={type}
                className={filter === type ? styles.filterActive : styles.filterBtn}
                onClick={() => setFilter(type)}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {canManageTeam && (
          <button className={styles.addBtn} onClick={() => { setEditingId(null); setShowForm(true); }}>
            + Add event
          </button>
        )}
      </div>

      {showForm && (
        <EventForm
          initial={editingId ? schedule.find((e) => e.id === editingId) : null}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
        />
      )}

      {view === 'calendar' ? (
        <ScheduleCalendar
          events={filtered}
          onEditEvent={handleEdit}
          onDeleteEvent={handleDelete}
          canEdit={canManageTeam}
        />
      ) : (
        <ul className={styles.list}>
          {sorted.length === 0 ? (
            <li className={styles.empty}>No events match. Add one or change the filter.</li>
          ) : (
            sorted.map((event) => (
              <li key={event.id} className={styles.card}>
                <span className={styles.typeBadge} data-type={event.type}>{event.type}</span>
                <div className={styles.content}>
                  <h3>{event.title}</h3>
                  <p className={styles.meta}>
                    {formatDate(event.date)}
                    {event.endDate && ` – ${formatDate(event.endDate)}`}
                    {' · '}
                    {getEventTimeLabel(event)}
                    {event.location && ` · ${event.location}`}
                  </p>
                  {event.opponent && <p className={styles.opponent}>vs. {event.opponent}</p>}
                  {event.notes && <p className={styles.notes}>{event.notes}</p>}
                </div>
                {canManageTeam && (
                  <div className={styles.actions}>
                    <button onClick={() => handleEdit(event)} className={styles.actionBtn} title="Update this event">Update</button>
                    <button onClick={() => handleDelete(event.id)} className={styles.actionBtnDanger}>Delete</button>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
