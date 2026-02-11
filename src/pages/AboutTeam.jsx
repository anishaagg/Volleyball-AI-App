import { useState } from 'react'
import { useTeam } from '../context/TeamContext'
import { useAuth } from '../context/AuthContext'
import CoachCard from '../components/CoachCard'
import styles from './AboutTeam.module.css'

function TeamPhotoBlock({ teamPhotoUrl, onSaveUrl, canEdit }) {
  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState(teamPhotoUrl || '')

  const handleSave = () => {
    onSaveUrl(url.trim())
    setEditing(false)
  }

  const handleCancel = () => {
    setUrl(teamPhotoUrl || '')
    setEditing(false)
  }

  const hasPhoto = teamPhotoUrl && teamPhotoUrl.startsWith('http')

  return (
    <section className={styles.teamPhotoSection}>
      {editing ? (
        <div className={styles.teamPhotoEdit}>
          <label className={styles.label}>
            Team photo URL
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={styles.input}
            />
          </label>
          <div className={styles.actions}>
            <button type="button" onClick={handleCancel} className={styles.cancelBtn}>Cancel</button>
            <button type="button" onClick={handleSave} className={styles.saveBtn}>Save</button>
          </div>
        </div>
      ) : (
        <div className={styles.teamPhotoWrap}>
          {hasPhoto ? (
            <img src={teamPhotoUrl} alt="Team" className={styles.teamPhoto} />
          ) : (
            <div className={styles.teamPhotoPlaceholder}>Team photo</div>
          )}
          {canEdit && (
            <button type="button" onClick={() => setEditing(true)} className={styles.teamPhotoBtn}>
              {hasPhoto ? 'Change team photo' : 'Add team photo'}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function ClubInfoBlock({ clubName, aboutClub, onSave, canEdit }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(clubName || '')
  const [about, setAbout] = useState(aboutClub || '')

  const handleOpen = () => {
    setName(clubName || '')
    setAbout(aboutClub || '')
    setEditing(true)
  }

  const handleSave = () => {
    onSave({ clubName: name.trim() || '', aboutClub: about.trim() || '' })
    setEditing(false)
  }

  const handleCancel = () => {
    setName(clubName || '')
    setAbout(aboutClub || '')
    setEditing(false)
  }

  return (
    <section className={styles.teamPhotoSection}>
      <h2 className={styles.sectionTitle}>Club / school</h2>
      {editing ? (
        <div className={styles.teamPhotoEdit}>
          <label className={styles.label}>
            Club or school name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lincoln High School"
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            About the club / school
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="A short description of your club or school..."
              className={styles.textarea}
              rows={4}
            />
          </label>
          <div className={styles.actions}>
            <button type="button" onClick={handleCancel} className={styles.cancelBtn}>Cancel</button>
            <button type="button" onClick={handleSave} className={styles.saveBtn}>Save</button>
          </div>
        </div>
      ) : (
        <div className={styles.clubInfoWrap}>
          {(clubName || aboutClub) ? (
            <>
              {clubName && <p className={styles.clubName}>{clubName}</p>}
              {aboutClub && <p className={styles.aboutClubText}>{aboutClub}</p>}
            </>
          ) : (
            <p className={styles.noClubInfo}>No club or school info set yet.</p>
          )}
          {canEdit && (
            <button type="button" onClick={handleOpen} className={styles.teamPhotoBtn}>
              {clubName || aboutClub ? 'Edit club / school info' : 'Add club / school info'}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function normalizeGuardians(player) {
  if (player.guardians && player.guardians.length > 0) return player.guardians
  if (player.parentContact)
    return [{ name: '', relationship: '', email: player.parentContact, phone: '' }]
  return []
}

export default function AboutTeam() {
  const { roster, dispatch } = useTeam()
  const { canManageTeam, canEditOwnPlayer } = useAuth()
  const [editingPlayerId, setEditingPlayerId] = useState(null)
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState('')
  const [playerGuardians, setPlayerGuardians] = useState([])
  const [playerName, setPlayerName] = useState('')
  const [playerNumber, setPlayerNumber] = useState('')
  const [playerPosition, setPlayerPosition] = useState('')
  const [playerGrade, setPlayerGrade] = useState('')
  const [playerEmail, setPlayerEmail] = useState('')
  const [playerParentContact, setPlayerParentContact] = useState('')
  const [showAddPlayer, setShowAddPlayer] = useState(false)

  const teamPhotoUrl = roster.teamPhotoUrl ?? ''

  const handleCoachSave = (payload) => {
    dispatch({ type: 'ROSTER_UPDATE_COACH', payload })
  }

  const handleTeamPhotoSave = (url) => {
    dispatch({ type: 'ROSTER_SET_TEAM_PHOTO', payload: url || '' })
  }

  const handleClubInfoSave = (payload) => {
    dispatch({ type: 'ROSTER_UPDATE_TEAM', payload })
  }

  const openPlayerEdit = (player) => {
    setEditingPlayerId(player.id)
    setPlayerPhotoUrl(player.photoUrl || '')
    setPlayerName(player.name || '')
    setPlayerNumber(player.number ?? '')
    setPlayerPosition(player.position || '')
    setPlayerGrade(player.grade || '')
    setPlayerEmail(player.email || '')
    setPlayerParentContact(player.parentContact || '')
    if (player.guardians?.length) {
      setPlayerGuardians(player.guardians.map((g) => ({ ...g })))
    } else if (player.parentContact) {
      setPlayerGuardians([{ name: '', relationship: '', email: player.parentContact, phone: '' }])
    } else {
      setPlayerGuardians([])
    }
  }

  const handlePlayerSave = () => {
    if (editingPlayerId) {
      const payload = {
        id: editingPlayerId,
        photoUrl: playerPhotoUrl.trim() || undefined,
        guardians: playerGuardians,
      }
      if (canManageTeam) {
        payload.name = playerName.trim() || undefined
        payload.number = Number(playerNumber) || 0
        payload.position = playerPosition.trim() || undefined
        payload.grade = playerGrade.trim() || undefined
        payload.email = playerEmail.trim() || undefined
        payload.parentContact = playerParentContact.trim() || undefined
      }
      dispatch({ type: 'ROSTER_UPDATE_PLAYER', payload })
      setEditingPlayerId(null)
      setPlayerPhotoUrl('')
      setPlayerGuardians([])
      setPlayerName('')
      setPlayerNumber('')
      setPlayerPosition('')
      setPlayerGrade('')
      setPlayerEmail('')
      setPlayerParentContact('')
    }
  }

  const closePlayerEdit = () => {
    setEditingPlayerId(null)
    setPlayerPhotoUrl('')
    setPlayerGuardians([])
    setPlayerName('')
    setPlayerNumber('')
    setPlayerPosition('')
    setPlayerGrade('')
    setPlayerEmail('')
    setPlayerParentContact('')
  }

  const addGuardian = () => {
    setPlayerGuardians((prev) => [...prev, { name: '', relationship: '', email: '', phone: '' }])
  }

  const updateGuardian = (index, field, value) => {
    setPlayerGuardians((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const removeGuardian = (index) => {
    setPlayerGuardians((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddPlayer = (data) => {
    dispatch({ type: 'ROSTER_ADD_PLAYER', payload: { ...data, photoUrl: '' } })
    setShowAddPlayer(false)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>About the Team</h1>
      <p className={styles.subtitle}>
        Roster: coaches and players.
        {canManageTeam ? ' You can add/edit team photo, coaches, and players.' : ' Players and parents can edit their own player\'s info (photo, guardian contacts).'}
      </p>

      <TeamPhotoBlock teamPhotoUrl={teamPhotoUrl} onSaveUrl={handleTeamPhotoSave} canEdit={canManageTeam} />

      <ClubInfoBlock
        clubName={roster.clubName ?? ''}
        aboutClub={roster.aboutClub ?? ''}
        onSave={handleClubInfoSave}
        canEdit={canManageTeam}
      />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Coaches</h2>
        <div className={styles.grid}>
          {roster.coaches.map((c) => (
            <CoachCard
              key={c.id}
              coach={{ ...c, photoUrl: c.photoUrl ?? '', description: c.description ?? '' }}
              onSave={handleCoachSave}
              canEdit={canManageTeam}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Players</h2>
          {canManageTeam && (
            <button type="button" onClick={() => setShowAddPlayer(true)} className={styles.addPlayerBtn}>
              + Add player
            </button>
          )}
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.photoCol}>Photo</th>
                <th>#</th>
                <th>Name</th>
                <th>Position</th>
                <th>Grade</th>
                <th>Parent/Guardian contacts</th>
                <th className={styles.actionCol}></th>
              </tr>
            </thead>
            <tbody>
              {roster.players.map((p) => (
                <tr key={p.id}>
                  <td className={styles.photoCol}>
                    {p.photoUrl && p.photoUrl.startsWith('http') ? (
                      <img src={p.photoUrl} alt={p.name} className={styles.playerThumb} />
                    ) : (
                      <div className={styles.playerAvatar}>{p.name.slice(0, 2).toUpperCase()}</div>
                    )}
                  </td>
                  <td className={styles.num}>{p.number}</td>
                  <td className={styles.name}>{p.name}</td>
                  <td>{p.position}</td>
                  <td>{p.grade}</td>
                  <td className={styles.guardiansCell}>
                    {normalizeGuardians(p).length > 0 ? (
                      <div className={styles.guardiansListCell}>
                        {normalizeGuardians(p).map((g, i) => (
                          <div key={i} className={styles.guardianChip}>
                            {(g.name || g.relationship) && (
                              <span>{[g.name, g.relationship].filter(Boolean).join(' — ')}</span>
                            )}
                            {g.email && <a href={`mailto:${g.email}`} className={styles.contactLink}>{g.email}</a>}
                            {g.phone && <span className={styles.guardianPhone}>{g.phone}</span>}
                            {!g.name && !g.email && !g.phone && !g.relationship && '—'}
                          </div>
                        ))}
                      </div>
                    ) : p.parentContact ? (
                      <a href={`mailto:${p.parentContact}`} className={styles.contactLink}>{p.parentContact}</a>
                    ) : (
                      <span className={styles.noContacts}>—</span>
                    )}
                  </td>
                  <td className={styles.actionCol}>
                    {(canManageTeam || canEditOwnPlayer(p.id)) && (
                      <button type="button" onClick={() => openPlayerEdit(p)} className={styles.photoEditBtn}>
                        Edit info
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editingPlayerId && (
        <PlayerEditModal
          player={roster.players.find((x) => x.id === editingPlayerId)}
          canEditAll={canManageTeam}
          photoUrl={playerPhotoUrl}
          setPhotoUrl={setPlayerPhotoUrl}
          guardians={playerGuardians}
          addGuardian={addGuardian}
          updateGuardian={updateGuardian}
          removeGuardian={removeGuardian}
          name={playerName}
          setName={setPlayerName}
          number={playerNumber}
          setNumber={setPlayerNumber}
          position={playerPosition}
          setPosition={setPlayerPosition}
          grade={playerGrade}
          setGrade={setPlayerGrade}
          email={playerEmail}
          setEmail={setPlayerEmail}
          parentContact={playerParentContact}
          setParentContact={setPlayerParentContact}
          onSave={handlePlayerSave}
          onClose={closePlayerEdit}
        />
      )}

      {showAddPlayer && (
        <AddPlayerForm
          onSave={handleAddPlayer}
          onCancel={() => setShowAddPlayer(false)}
        />
      )}
    </div>
  )
}

function PlayerEditModal({
  player,
  canEditAll,
  photoUrl,
  setPhotoUrl,
  guardians,
  addGuardian,
  updateGuardian,
  removeGuardian,
  name,
  setName,
  number,
  setNumber,
  position,
  setPosition,
  grade,
  setGrade,
  email,
  setEmail,
  parentContact,
  setParentContact,
  onSave,
  onClose,
}) {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={canEditAll ? styles.modalWide : styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Edit info — {player?.name}</h3>

        {canEditAll && (
          <div className={styles.modalSection}>
            <h4 className={styles.modalSectionTitle}>Player details</h4>
            <div className={styles.playerFieldsGrid}>
              <label className={styles.label}>
                Name *
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className={styles.input}
                  required
                />
              </label>
              <label className={styles.label}>
                Jersey #
                <input
                  type="number"
                  min={0}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="#"
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Position
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Setter"
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Grade
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. 11"
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Email (for login)
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@example.com"
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Parent contact (fallback)
                <input
                  type="text"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  placeholder="Email if no guardians below"
                  className={styles.input}
                />
              </label>
            </div>
          </div>
        )}

        <div className={styles.modalSection}>
          <h4 className={styles.modalSectionTitle}>Photo</h4>
          <label className={styles.label}>
            Photo URL
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className={styles.input}
            />
          </label>
        </div>

        <div className={styles.modalSection}>
          <div className={styles.modalSectionHeader}>
            <h4 className={styles.modalSectionTitle}>Parents / Guardians</h4>
            <button type="button" onClick={addGuardian} className={styles.addGuardianBtn}>+ Add contact</button>
          </div>
          {guardians.length === 0 ? (
            <p className={styles.noGuardiansHint}>No contacts yet. Add a parent or guardian.</p>
          ) : (
            <ul className={styles.guardiansList}>
              {guardians.map((g, index) => (
                <li key={index} className={styles.guardianRow}>
                  <input
                    type="text"
                    value={g.name}
                    onChange={(e) => updateGuardian(index, 'name', e.target.value)}
                    placeholder="Name"
                    className={styles.input}
                  />
                  <input
                    type="text"
                    value={g.relationship}
                    onChange={(e) => updateGuardian(index, 'relationship', e.target.value)}
                    placeholder="Relationship (e.g. Mother, Father)"
                    className={styles.input}
                  />
                  <input
                    type="email"
                    value={g.email}
                    onChange={(e) => updateGuardian(index, 'email', e.target.value)}
                    placeholder="Email"
                    className={styles.input}
                  />
                  <input
                    type="tel"
                    value={g.phone}
                    onChange={(e) => updateGuardian(index, 'phone', e.target.value)}
                    placeholder="Phone"
                    className={styles.input}
                  />
                  <button type="button" onClick={() => removeGuardian(index)} className={styles.removeGuardianBtn} title="Remove">×</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
          <button type="button" onClick={onSave} className={styles.saveBtn}>Save</button>
        </div>
      </div>
    </div>
  )
}

function AddPlayerForm({ onSave, onCancel }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [number, setNumber] = useState('')
  const [position, setPosition] = useState('')
  const [grade, setGrade] = useState('')
  const [parentContact, setParentContact] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [guardianRelationship, setGuardianRelationship] = useState('')
  const [guardianEmail, setGuardianEmail] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const guardians = []
    if (guardianName.trim() || guardianEmail.trim() || guardianPhone.trim() || guardianRelationship.trim()) {
      guardians.push({
        name: guardianName.trim(),
        relationship: guardianRelationship.trim(),
        email: guardianEmail.trim(),
        phone: guardianPhone.trim(),
      })
    }
    onSave({
      name: name.trim(),
      email: email.trim() || '',
      number: Number(number) || 0,
      position: position.trim() || '',
      grade: grade.trim() || '',
      parentContact: parentContact.trim() || '',
      guardians,
      photoUrl: '',
    })
    setName('')
    setEmail('')
    setNumber('')
    setPosition('')
    setGrade('')
    setParentContact('')
    setGuardianName('')
    setGuardianRelationship('')
    setGuardianEmail('')
    setGuardianPhone('')
  }

  return (
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Add player</h3>
        <form onSubmit={handleSubmit} className={styles.addPlayerForm}>
          <label className={styles.label}>Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={styles.input} required placeholder="Full name" />
          <label className={styles.label}>Email (for login)</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} placeholder="player@example.com" />
          <label className={styles.label}>Number</label>
          <input type="number" min="0" value={number} onChange={(e) => setNumber(e.target.value)} className={styles.input} placeholder="Jersey #" />
          <label className={styles.label}>Position</label>
          <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className={styles.input} placeholder="e.g. Setter" />
          <label className={styles.label}>Grade</label>
          <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className={styles.input} placeholder="e.g. 11" />
          <div className={styles.guardianFields}>
            <label className={styles.label}>Parent/Guardian (optional)</label>
            <input type="text" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className={styles.input} placeholder="Name" />
            <input type="text" value={guardianRelationship} onChange={(e) => setGuardianRelationship(e.target.value)} className={styles.input} placeholder="Relationship (e.g. Mother)" />
            <input type="email" value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} className={styles.input} placeholder="Email" />
            <input type="tel" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} className={styles.input} placeholder="Phone" />
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Add player</button>
          </div>
        </form>
      </div>
    </div>
  )
}
