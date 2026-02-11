import { Link } from 'react-router-dom'
import { useTeam } from '../context/TeamContext'
import { formatDate, getEventTimeLabel, sortByDate } from '../utils/schedule'
import styles from './Home.module.css'

export default function Home() {
  const { schedule, roster } = useTeam()
  const upcoming = sortByDate(schedule).filter((e) => e.date >= new Date().toISOString().slice(0, 10)).slice(0, 5)
  const teamPhotoUrl = roster.teamPhotoUrl ?? ''
  const clubName = (roster.clubName ?? '').trim()
  const aboutClub = (roster.aboutClub ?? '').trim()
  const hasPhoto = teamPhotoUrl && teamPhotoUrl.startsWith('http')

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        {hasPhoto && (
          <div className={styles.heroPhotoWrap}>
            <img src={teamPhotoUrl} alt="Team" className={styles.heroPhoto} />
          </div>
        )}
        <div className={styles.heroText}>
          <h1 className={styles.title}>{clubName || 'Team Dashboard'}</h1>
          <p className={styles.subtitle}>Schedule, roster, and messages in one place.</p>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>About the club / school</h2>
        {aboutClub ? (
          <p className={styles.aboutText}>{aboutClub}</p>
        ) : (
          <p className={styles.aboutEmpty}>No description yet. Coaches can add one on the About the Team page.</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Upcoming events</h2>
          <Link to="/schedule" className={styles.link}>View full schedule →</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className={styles.empty}>No upcoming events. Add some on the Schedule page.</p>
        ) : (
          <ul className={styles.eventList}>
            {upcoming.map((event) => (
              <li key={event.id} className={styles.eventCard}>
                <span className={styles.eventType} data-type={event.type}>{event.type}</span>
                <div className={styles.eventInfo}>
                  <strong>{event.title}</strong>
                  <span className={styles.eventMeta}>
                    {formatDate(event.date)}
                    {event.endDate && ` – ${formatDate(event.endDate)}`}
                    {' · '}
                    {getEventTimeLabel(event)}
                    {event.location && ` · ${event.location}`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.quickLinks}>
        <Link to="/about" className={styles.quickCard}>
          <span className={styles.quickIcon}>👥</span>
          <span className={styles.quickLabel}>Roster</span>
          <span className={styles.quickCount}>{roster.players.length} players, {roster.coaches.length} coaches</span>
        </Link>
        <Link to="/messages" className={styles.quickCard}>
          <span className={styles.quickIcon}>💬</span>
          <span className={styles.quickLabel}>Messages</span>
          <span className={styles.quickCount}>Coach updates & announcements</span>
        </Link>
      </section>
    </div>
  )
}
