import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTeam } from '../context/TeamContext'
import styles from './ManageTeams.module.css'

export default function ManageTeams() {
  const { isDirector } = useAuth()
  const { teams, currentTeamId, dispatch } = useTeam()
  const navigate = useNavigate()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [newTeamName, setNewTeamName] = useState('')

  if (!isDirector) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Manage teams</h1>
        <p className={styles.subtitle}>Only directors can manage teams. Log in as a director to add, rename, or remove teams.</p>
      </div>
    )
  }

  const startEdit = (team) => {
    setEditingId(team.id)
    setEditName(team.name)
  }

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      dispatch({ type: 'TEAM_UPDATE', payload: { id: editingId, name: editName.trim() } })
      setEditingId(null)
      setEditName('')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleAddTeam = () => {
    const name = newTeamName.trim() || 'New Team'
    dispatch({ type: 'TEAM_ADD', payload: { name } })
    setNewTeamName('')
  }

  const handleRemove = (id) => {
    if (teams.length <= 1) return
    if (window.confirm('Remove this team? Schedule, roster, and messages for this team will be deleted.')) {
      dispatch({ type: 'TEAM_REMOVE', payload: id })
    }
  }

  const switchTo = (id) => {
    dispatch({ type: 'TEAM_SWITCH', payload: id })
  }

  const goToRoster = (teamId) => {
    dispatch({ type: 'TEAM_SWITCH', payload: teamId })
    navigate('/about')
  }

  const goToSchedule = (teamId) => {
    dispatch({ type: 'TEAM_SWITCH', payload: teamId })
    navigate('/schedule')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Director Dashboard</h1>
      <p className={styles.subtitle}>
        View and manage all club teams. Edit rosters and schedules for any team.
      </p>

      <div className={styles.clubwideRow}>
        <Link to="/messages" className={styles.clubwideBtn}>
          Send club-wide message
        </Link>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Teams</h2>
          <div className={styles.addRow}>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="New team name"
              className={styles.input}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
            />
            <button type="button" onClick={handleAddTeam} className={styles.addBtn}>
              Add team
            </button>
          </div>
        </div>

        <ul className={styles.teamList}>
          {teams.map((team) => (
            <li key={team.id} className={styles.teamCard} data-active={team.id === currentTeamId}>
              {editingId === team.id ? (
                <div className={styles.editRow}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={styles.input}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                  />
                  <button type="button" onClick={saveEdit} className={styles.saveBtn}>Save</button>
                  <button type="button" onClick={cancelEdit} className={styles.cancelBtn}>Cancel</button>
                </div>
              ) : (
                <>
                  <div className={styles.teamInfo}>
                    <span className={styles.teamName}>{team.name}</span>
                    {team.id === currentTeamId && <span className={styles.currentBadge}>Current</span>}
                    <span className={styles.teamMeta}>
                      {team.roster?.players?.length ?? 0} players, {team.roster?.coaches?.length ?? 0} coaches, {team.schedule?.length ?? 0} events
                    </span>
                  </div>
                  <div className={styles.teamActions}>
                    <button type="button" onClick={() => goToRoster(team.id)} className={styles.actionBtn} title="Edit roster">
                      Roster
                    </button>
                    <button type="button" onClick={() => goToSchedule(team.id)} className={styles.actionBtn} title="Manage schedule">
                      Schedule
                    </button>
                    {team.id !== currentTeamId && (
                      <button type="button" onClick={() => switchTo(team.id)} className={styles.switchBtn}>
                        Switch to this team
                      </button>
                    )}
                    <button type="button" onClick={() => startEdit(team)} className={styles.actionBtn} title="Rename">
                      Rename
                    </button>
                    {teams.length > 1 && (
                      <button type="button" onClick={() => handleRemove(team.id)} className={styles.removeBtn} title="Remove team">
                        Remove
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
