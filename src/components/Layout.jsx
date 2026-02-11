import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTeam } from '../context/TeamContext'
import { getUnreadCount } from '../utils/messages'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, logout, isCoach, isParent, isDirector } = useAuth()
  const { messages, teams, currentTeamId, dispatch } = useTeam()
  const unreadCount = getUnreadCount(messages, user)

  const roleLabel = isDirector ? 'Director' : isCoach ? 'Coach' : isParent ? 'Parent/Guardian' : 'Player'
  const displayName = isDirector ? 'Director' : isParent ? `Guardian of ${user?.name}` : user?.name

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🏐</span>
          <span>Setly</span>
        </NavLink>
        <nav className={styles.nav}>
          {(isDirector || isCoach) && (
            <select
              value={currentTeamId}
              onChange={(e) => dispatch({ type: 'TEAM_SWITCH', payload: e.target.value })}
              className={styles.teamSelect}
              title="Switch team"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.navActive : '')}>
            Home
          </NavLink>
          <NavLink to="/schedule" className={({ isActive }) => (isActive ? styles.navActive : '')}>
            Schedule
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? styles.navActive : '')}>
            About the Team
          </NavLink>
          <NavLink to="/messages" className={({ isActive }) => (isActive ? styles.navActive : '')}>
            <span className={styles.navLinkWrap}>
              Messages
              {unreadCount > 0 && <span className={styles.messageBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </span>
          </NavLink>
          {isDirector && (
            <NavLink to="/teams" className={({ isActive }) => (isActive ? styles.navActive : '')}>
              Manage teams
            </NavLink>
          )}
        </nav>
        <div className={styles.userBar}>
          <span className={styles.userName} title={roleLabel}>
            {displayName}{isCoach ? ' (Coach)' : isDirector ? ' (Director)' : ''}
          </span>
          <button type="button" onClick={logout} className={styles.logoutBtn}>Log out</button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
