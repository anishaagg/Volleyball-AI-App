import { useState } from 'react'
import styles from './MessageCompose.module.css'

export default function MessageCompose({ recipients, onSend, onCancel }) {
  const [to, setTo] = useState('all')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const toOption = recipients.find((r) => r.id === to)
  const toName = toOption?.name || 'All'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) return
    onSend(to, toName, subject.trim(), body.trim())
    setSubject('')
    setBody('')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>New message</h3>

      <label className={styles.label}>
        To
        <select value={to} onChange={(e) => setTo(e.target.value)} className={styles.input}>
          {recipients.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>

      <label className={styles.label}>
        Subject
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Schedule update"
          className={styles.input}
          required
        />
      </label>

      <label className={styles.label}>
        Message
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message..."
          className={styles.textarea}
          rows={5}
          required
        />
      </label>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn}>Cancel</button>
        <button type="submit" className={styles.submitBtn}>Send</button>
      </div>
    </form>
  )
}
