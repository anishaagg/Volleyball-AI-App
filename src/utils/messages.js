/**
 * True if the user is a receiver of this message (not the sender).
 * - to 'all' -> receivers are players and parents
 * - to 'coaches' -> receivers are coaches
 * - to playerId -> receivers are that player and parents of that player
 */
export function isReceiver(message, user) {
  if (!user?.id) return false
  if (message.from === user.id) return false
  const to = message.to
  if (to === 'all') return user.role === 'player' || user.role === 'parent'
  if (to === 'coaches') return user.role === 'coach'
  return user.id === to || user.playerId === to
}

/** True if the user is a receiver and has not read the message. */
export function isUnread(message, user) {
  if (!user?.id) return false
  if (!isReceiver(message, user)) return false
  return !(message.readBy || []).includes(user.id)
}

export function getUnreadCount(messages, user) {
  if (!user?.id) return 0
  return messages.filter((m) => isUnread(m, user)).length
}

/** True if the user sent this message. */
export function isSentByUser(message, user) {
  return user?.id && message.from === user.id
}

/** Inbox: messages where the user is a receiver. */
export function getInboxMessages(messages, user) {
  if (!user?.id) return []
  return messages.filter((m) => isReceiver(m, user))
}

/** Sent: messages where the user is the sender. */
export function getSentMessages(messages, user) {
  if (!user?.id) return []
  return messages.filter((m) => isSentByUser(m, user))
}
