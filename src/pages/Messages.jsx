import { useState, useEffect } from 'react'
import { useTeam } from '../context/TeamContext'
import { useAuth } from '../context/AuthContext'
import { isUnread, isReceiver, getInboxMessages, getSentMessages } from '../utils/messages'
import MessageCompose from '../components/MessageCompose'
import styles from './Messages.module.css'

function formatMessageDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const COACHES_RECIPIENT = { id: 'coaches', name: 'Coaches' }
const FOLDER_INBOX = 'inbox'
const FOLDER_SENT = 'sent'

export default function Messages() {
  const { messages, roster, dispatch } = useTeam()
  const { user, canManageTeam, isParent } = useAuth()
  const [folder, setFolder] = useState(FOLDER_INBOX)
  const [selectedId, setSelectedId] = useState(null)
  const [composeOpen, setComposeOpen] = useState(false)

  const inboxMessages = getInboxMessages(messages, user)
  const sentMessages = getSentMessages(messages, user)
  const folderMessages = folder === FOLDER_INBOX ? inboxMessages : sentMessages
  const sortedFolderMessages = [...folderMessages].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))

  const coachRecipients = [
    { id: 'all', name: 'All Parents & Players' },
    ...roster.players.map((p) => ({ id: p.id, name: `${p.name} (Player)` })),
  ]
  const recipients = canManageTeam ? coachRecipients : [COACHES_RECIPIENT]

  const unreadCount = messages.filter((m) => isUnread(m, user)).length
  const selected = selectedId ? messages.find((m) => m.id === selectedId) : null
  const selectedInCurrentFolder = selected && folderMessages.some((m) => m.id === selected.id)

  const switchFolder = (newFolder) => {
    setFolder(newFolder)
    setSelectedId(null)
  }
  const selectedIsUnread = selected && isUnread(selected, user)
  const selectedIsReadByMe = selected && user && (selected.readBy || []).includes(user.id)
  const canMarkUnread = selected && isReceiver(selected, user) && selectedIsReadByMe
  const canDelete = selected && user && selected.from === user.id

  useEffect(() => {
    if (selected && user && isUnread(selected, user)) {
      dispatch({ type: 'MESSAGE_MARK_READ', payload: { messageId: selected.id, userId: user.id } })
    }
  }, [selected?.id, user?.id, dispatch])

  const handleMarkUnread = () => {
    if (selected?.id && user?.id) {
      dispatch({ type: 'MESSAGE_MARK_UNREAD', payload: { messageId: selected.id, userId: user.id } })
    }
  }

  const handleDelete = () => {
    if (!selected?.id) return
    if (window.confirm('Delete this message? This cannot be undone.')) {
      dispatch({ type: 'MESSAGE_REMOVE', payload: selected.id })
      setSelectedId(null)
    }
  }

  const handleCloseMessage = () => setSelectedId(null)

  const handleSend = (to, toName, subject, body) => {
    const payload = { to, toName, subject, body }
    if (!canManageTeam && user) {
      payload.from = user.id
      payload.fromName = isParent ? `Guardian of ${user.name}` : user.name
    }
    dispatch({ type: 'MESSAGE_SEND', payload })
    setComposeOpen(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Messages</h1>
        <p className={styles.subtitle}>
          {canManageTeam ? 'Send updates and announcements to parents and players.' : 'Send a message to the coaches.'}
        </p>
        <button className={styles.composeBtn} onClick={() => setComposeOpen(true)}>
          + New message
        </button>
      </div>

      {composeOpen && (
        <MessageCompose
          recipients={recipients}
          onSend={handleSend}
          onCancel={() => setComposeOpen(false)}
        />
      )}

      <div className={styles.folders}>
        <button
          type="button"
          className={folder === FOLDER_INBOX ? styles.folderActive : styles.folderBtn}
          onClick={() => switchFolder(FOLDER_INBOX)}
        >
          Inbox
          {unreadCount > 0 && <span className={styles.folderBadge}>{unreadCount}</span>}
        </button>
        <button
          type="button"
          className={folder === FOLDER_SENT ? styles.folderActive : styles.folderBtn}
          onClick={() => switchFolder(FOLDER_SENT)}
        >
          Sent
        </button>
      </div>

      <div className={`${styles.layout} ${selected && selectedInCurrentFolder ? styles.layoutMessageOpen : ''}`}>
        <aside className={styles.list}>
          {sortedFolderMessages.length === 0 ? (
            <p className={styles.empty}>
              {folder === FOLDER_INBOX ? 'No messages in inbox.' : 'No sent messages.'}
            </p>
          ) : (
            sortedFolderMessages.map((m) => (
              <button
                key={m.id}
                className={`${selected?.id === m.id ? styles.threadActive : styles.thread} ${folder === FOLDER_INBOX && isUnread(m, user) ? styles.threadUnread : ''}`}
                onClick={() => setSelectedId(m.id)}
              >
                {folder === FOLDER_INBOX && isUnread(m, user) && <span className={styles.unreadDot} aria-hidden />}
                <span className={styles.threadFrom}>{m.fromName} → {m.toName}</span>
                <span className={styles.threadSubject}>{m.subject}</span>
                <span className={styles.threadDate}>{formatMessageDate(m.sentAt)}</span>
              </button>
            ))
          )}
        </aside>
        <div className={styles.detail}>
          {selected && selectedInCurrentFolder ? (
            <>
              <div className={styles.detailToolbar}>
                <button type="button" onClick={handleCloseMessage} className={styles.closeMessageBtn}>
                  ← Close
                </button>
                <div className={styles.detailActions}>
                  {canMarkUnread && (
                    <button type="button" onClick={handleMarkUnread} className={styles.markUnreadBtn}>
                      Mark as unread
                    </button>
                  )}
                  {canDelete && (
                    <button type="button" onClick={handleDelete} className={styles.deleteMessageBtn}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.detailHeader}>
                <h2 className={styles.detailSubject}>{selected.subject}</h2>
                <span className={styles.detailMeta}>
                  {selected.fromName} → {selected.toName} · {formatMessageDate(selected.sentAt)}
                </span>
              </div>
              <div className={styles.detailBody}>{selected.body}</div>
            </>
          ) : (
            <p className={styles.emptyDetail}>
              {folder === FOLDER_INBOX ? 'Select a message to read it.' : 'Select a sent message to view it.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
