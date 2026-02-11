import { useState, useEffect } from 'react'
import styles from './CoachCard.module.css'

export default function CoachCard({ coach, onSave, onCancel, canEdit = true }) {
  const [editing, setEditing] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(coach.photoUrl || '')
  const [description, setDescription] = useState(coach.description || '')

  useEffect(() => {
    setPhotoUrl(coach.photoUrl || '')
    setDescription(coach.description || '')
    setPhotoError(false)
  }, [coach.photoUrl, coach.description])

  const handleSave = () => {
    onSave({ id: coach.id, photoUrl: photoUrl.trim() || undefined, description: description.trim() || undefined })
    setEditing(false)
  }

  const handleCancel = () => {
    setPhotoUrl(coach.photoUrl || '')
    setDescription(coach.description || '')
    setEditing(false)
    onCancel?.()
  }

  const [photoError, setPhotoError] = useState(false)
  const hasPhoto = photoUrl && photoUrl.startsWith('http') && !photoError

  return (
    <div className={styles.card}>
      {editing ? (
        <>
          <div className={styles.editForm}>
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
            <label className={styles.label}>
              About me & coaching style
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell players a little about yourself and your coaching style..."
                className={styles.textarea}
                rows={4}
              />
            </label>
            <div className={styles.actions}>
              <button type="button" onClick={handleCancel} className={styles.cancelBtn}>Cancel</button>
              <button type="button" onClick={handleSave} className={styles.saveBtn}>Save</button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.avatarWrap}>
            {hasPhoto ? (
              <img src={photoUrl} alt={coach.name} className={styles.photo} onError={() => setPhotoError(true)} />
            ) : (
              <div className={styles.avatar}>{coach.name.slice(0, 2).toUpperCase()}</div>
            )}
          </div>
          <div className={styles.info}>
            <strong className={styles.name}>{coach.name}</strong>
            <span className={styles.role}>{coach.role}</span>
            {coach.description && <p className={styles.description}>{coach.description}</p>}
            {coach.email && <a href={`mailto:${coach.email}`} className={styles.contact}>{coach.email}</a>}
            {coach.phone && <span className={styles.contact}>{coach.phone}</span>}
            {canEdit && (
              <button type="button" onClick={() => setEditing(true)} className={styles.editBtn}>Add/Edit photo & description</button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
