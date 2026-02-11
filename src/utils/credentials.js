const CREDENTIALS_KEY = 'setly-credentials'
const DIRECTOR_KEY = 'setly-director'
const DEFAULT_PASSWORD = 'volleyball'
const DEFAULT_DIRECTOR_PASSWORD = 'director'

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function loadCredentials() {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveCredentials(creds) {
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds))
  } catch (_) {}
}

/** Build a map of email -> { passwordHash, role, id, name, playerId? } from roster; merge with existing credentials (keep existing hashes, add new emails with default hash). */
let defaultHashCache = null

export async function syncCredentialsFromRoster(roster) {
  const existing = loadCredentials()
  if (!defaultHashCache) defaultHashCache = await hashPassword(DEFAULT_PASSWORD)
  const defaultHash = defaultHashCache

  const next = { ...existing }
  const normalize = (e) => (e || '').toLowerCase().trim()

  for (const c of roster.coaches || []) {
    const email = normalize(c.email)
    if (!email) continue
    if (!next[email]) {
      next[email] = { passwordHash: defaultHash, role: 'coach', id: c.id, name: c.name }
    } else {
      next[email] = { ...next[email], id: c.id, name: c.name, role: 'coach' }
    }
  }

  for (const p of roster.players || []) {
    const email = normalize(p.email)
    if (!email) continue
    if (!next[email]) {
      next[email] = { passwordHash: defaultHash, role: 'player', id: p.id, name: p.name }
    } else {
      next[email] = { ...next[email], id: p.id, name: p.name, role: 'player' }
    }
  }

  for (const p of roster.players || []) {
    for (const g of p.guardians || []) {
      const email = normalize(g.email)
      if (!email) continue
      if (!next[email]) {
        next[email] = {
          passwordHash: defaultHash,
          role: 'parent',
          id: 'parent-' + p.id,
          name: p.name,
          playerId: p.id,
        }
      } else {
        next[email] = { ...next[email], id: 'parent-' + p.id, name: p.name, playerId: p.id, role: 'parent' }
      }
    }
  }

  saveCredentials(next)
  return next
}

const DIRECTOR_EMAIL = 'director@setly.app'

/** Verify email + password. Returns { role, id, name, playerId? } or null. */
export async function verifyCredentials(email, password) {
  const normalized = (email || '').toLowerCase().trim()

  if (normalized === DIRECTOR_EMAIL.toLowerCase()) {
    try {
      let raw = localStorage.getItem(DIRECTOR_KEY)
      if (!raw) {
        const passwordHash = await hashPassword(DEFAULT_DIRECTOR_PASSWORD)
        const director = { email: DIRECTOR_EMAIL, passwordHash }
        localStorage.setItem(DIRECTOR_KEY, JSON.stringify(director))
        raw = JSON.stringify(director)
      }
      const director = JSON.parse(raw)
      const hash = await hashPassword(password)
      if (hash === director.passwordHash) {
        return { role: 'director', id: 'director', name: 'Director' }
      }
    } catch (_) {}
    return null
  }

  const creds = loadCredentials()
  const entry = creds[normalized]
  if (!entry) return null
  const hash = await hashPassword(password)
  if (hash !== entry.passwordHash) return null
  return {
    role: entry.role,
    id: entry.id,
    name: entry.name,
    playerId: entry.playerId,
  }
}

/** Change password for an email (must be logged in or we'd need another auth path). */
export async function setPasswordForEmail(email, newPassword) {
  const creds = loadCredentials()
  const normalized = (email || '').toLowerCase().trim()
  if (!creds[normalized]) return false
  creds[normalized] = { ...creds[normalized], passwordHash: await hashPassword(newPassword) }
  saveCredentials(creds)
  return true
}
