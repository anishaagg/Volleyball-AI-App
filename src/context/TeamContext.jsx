import { createContext, useContext, useReducer, useEffect, useMemo } from 'react'

const STORAGE_KEY = 'setly-app'

const defaultRoster = {
  teamPhotoUrl: '',
  clubName: '',
  aboutClub: '',
  coaches: [
    { id: 'c1', name: 'Sarah Chen', role: 'Head Coach', email: 'sarah.chen@team.com', phone: '(555) 101-2020', photoUrl: '', description: '' },
    { id: 'c2', name: 'Mike Torres', role: 'Assistant Coach', email: 'mike.t@team.com', phone: '(555) 102-2021', photoUrl: '', description: '' },
  ],
  players: [
    { id: 'p1', name: 'Emma Johnson', number: 7, position: 'Setter', grade: '11', email: 'emma.johnson@email.com', parentContact: 'johnson@email.com', photoUrl: '', guardians: [{ name: 'Jane Johnson', relationship: 'Mother', email: 'johnson@email.com', phone: '' }] },
    { id: 'p2', name: 'Jordan Lee', number: 12, position: 'Outside Hitter', grade: '10', email: 'jordan.lee@email.com', parentContact: 'lee.family@email.com', photoUrl: '', guardians: [] },
    { id: 'p3', name: 'Alex Rivera', number: 3, position: 'Libero', grade: '11', email: 'alex.rivera@email.com', parentContact: 'rivera.a@email.com', photoUrl: '', guardians: [] },
    { id: 'p4', name: 'Taylor Kim', number: 9, position: 'Middle Blocker', grade: '12', email: 'taylor.kim@email.com', parentContact: 'tkim@email.com', photoUrl: '', guardians: [] },
    { id: 'p5', name: 'Morgan Davis', number: 5, position: 'Opposite', grade: '10', email: 'morgan.davis@email.com', parentContact: 'mdavis@email.com', photoUrl: '', guardians: [] },
    { id: 'p6', name: 'Casey Williams', number: 14, position: 'Outside Hitter', grade: '11', email: 'casey.williams@email.com', parentContact: 'cwilliams@email.com', photoUrl: '', guardians: [] },
  ],
}

const defaultSchedule = [
  { id: 'e1', type: 'practice', title: 'Evening Practice', date: '2026-02-11', time: '16:00', location: 'Main Gym', notes: 'Focus on serving and receive.' },
  { id: 'e2', type: 'game', title: 'vs. Westside Eagles', date: '2026-02-14', time: '17:30', location: 'Home — Main Gym', opponent: 'Westside Eagles', notes: 'Wear home jerseys.' },
  { id: 'e3', type: 'practice', title: 'Morning Practice', date: '2026-02-15', time: '08:00', location: 'Main Gym', notes: 'Film review + drills.' },
  { id: 'e4', type: 'tournament', title: 'Spring Invitational', date: '2026-02-21', time: '08:00', endDate: '2026-02-22', location: 'Regional Sports Complex', notes: 'All-day Saturday; bracket Sunday.' },
  { id: 'e5', type: 'game', title: 'vs. Northview Hawks', date: '2026-02-18', time: '18:00', location: 'Away — Northview HS', opponent: 'Northview Hawks', notes: 'Bus departs 16:30.' },
  { id: 'e6', type: 'practice', title: 'Scrimmage Prep', date: '2026-02-20', time: '16:00', location: 'Main Gym', notes: '6v6 scrimmage.' },
]

const defaultMessages = [
  { id: 'm1', from: 'c1', fromName: 'Coach Sarah', to: 'all', toName: 'All Parents & Players', subject: 'Week of Feb 10 — Schedule reminder', body: 'Please check the updated schedule. We have a game Tuesday and tournament next weekend. Confirm availability in Messages.', sentAt: '2026-02-09T14:00:00', readBy: [] },
  { id: 'm2', from: 'c1', fromName: 'Coach Sarah', to: 'p1', toName: 'Emma Johnson', subject: 'Setter clinic this Saturday', body: 'Emma — there\'s an optional setter clinic Saturday 9–11am at the rec center. Let me know if you can make it!', sentAt: '2026-02-08T09:30:00', readBy: [] },
]

function createDefaultTeam(id, name) {
  return {
    id,
    name: name || 'New Team',
    roster: JSON.parse(JSON.stringify(defaultRoster)),
    schedule: JSON.parse(JSON.stringify(defaultSchedule)),
    messages: JSON.parse(JSON.stringify(defaultMessages)),
  }
}

const DEFAULT_TEAM_ID = 't1'
const defaultTeams = [createDefaultTeam(DEFAULT_TEAM_ID, 'Varsity')]

export const initialState = {
  teams: defaultTeams,
  currentTeamId: DEFAULT_TEAM_ID,
}

function getCurrentTeam(state) {
  const team = state.teams.find((t) => t.id === state.currentTeamId)
  return team || state.teams[0] || null
}

function updateCurrentTeam(state, updater) {
  const idx = state.teams.findIndex((t) => t.id === state.currentTeamId)
  if (idx < 0) return state
  const team = state.teams[idx]
  const nextTeam = typeof updater === 'function' ? updater(team) : { ...team, ...updater }
  const nextTeams = [...state.teams]
  nextTeams[idx] = nextTeam
  return { ...state, teams: nextTeams }
}

const LEGACY_STORAGE_KEY = 'volleyball-team-app'

function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (raw === localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, raw)
    }
    return data
  } catch {
    return null
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (_) {}
}

/** Migrate old single-team state to multi-team shape */
function migrateState(saved) {
  if (saved.teams && Array.isArray(saved.teams) && saved.currentTeamId) {
    return saved
  }
  if (saved.roster || saved.schedule || saved.messages) {
    return {
      teams: [
        {
          id: DEFAULT_TEAM_ID,
          name: 'Varsity',
          roster: saved.roster || defaultRoster,
          schedule: saved.schedule || defaultSchedule,
          messages: saved.messages || defaultMessages,
        },
      ],
      currentTeamId: DEFAULT_TEAM_ID,
    }
  }
  return null
}

export function reducer(state, action) {
  switch (action.type) {
    case 'LOAD': {
      const migrated = migrateState(action.payload)
      if (migrated) return { ...initialState, ...migrated }
      return state
    }
    case 'TEAM_ADD': {
      const name = action.payload?.name || 'New Team'
      const id = 't' + Date.now()
      const newTeam = createDefaultTeam(id, name)
      return {
        ...state,
        teams: [...state.teams, newTeam],
        currentTeamId: id,
      }
    }
    case 'TEAM_SWITCH':
      return {
        ...state,
        currentTeamId: action.payload,
      }
    case 'TEAM_UPDATE': {
      const { id, name } = action.payload
      const idx = state.teams.findIndex((t) => t.id === id)
      if (idx < 0) return state
      const nextTeams = [...state.teams]
      nextTeams[idx] = { ...nextTeams[idx], name: name ?? nextTeams[idx].name }
      return { ...state, teams: nextTeams }
    }
    case 'TEAM_REMOVE': {
      const id = action.payload
      if (state.teams.length <= 1) return state
      const nextTeams = state.teams.filter((t) => t.id !== id)
      const nextCurrent = state.currentTeamId === id ? (nextTeams[0]?.id ?? state.currentTeamId) : state.currentTeamId
      return { ...state, teams: nextTeams, currentTeamId: nextCurrent }
    }
    case 'ROSTER_ADD_COACH':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        roster: {
          ...team.roster,
          coaches: [...team.roster.coaches, { ...action.payload, id: 'c' + Date.now() }],
        },
      }))
    case 'ROSTER_ADD_PLAYER':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        roster: {
          ...team.roster,
          players: [...team.roster.players, { ...action.payload, id: 'p' + Date.now() }],
        },
      }))
    case 'ROSTER_UPDATE_COACH':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        roster: {
          ...team.roster,
          coaches: team.roster.coaches.map((c) => (c.id === action.payload.id ? { ...c, ...action.payload } : c)),
        },
      }))
    case 'ROSTER_UPDATE_PLAYER':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        roster: {
          ...team.roster,
          players: team.roster.players.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload } : p)),
        },
      }))
    case 'ROSTER_REMOVE_COACH':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        roster: { ...team.roster, coaches: team.roster.coaches.filter((c) => c.id !== action.payload) },
      }))
    case 'ROSTER_REMOVE_PLAYER':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        roster: { ...team.roster, players: team.roster.players.filter((p) => p.id !== action.payload) },
      }))
    case 'ROSTER_SET_TEAM_PHOTO':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        roster: { ...team.roster, teamPhotoUrl: action.payload || '' },
      }))
    case 'ROSTER_UPDATE_TEAM':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        roster: { ...team.roster, ...action.payload },
      }))
    case 'SCHEDULE_ADD':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        schedule: [...team.schedule, { ...action.payload, id: 'e' + Date.now() }],
      }))
    case 'SCHEDULE_UPDATE':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        schedule: team.schedule.map((e) => (e.id === action.payload.id ? { ...e, ...action.payload } : e)),
      }))
    case 'SCHEDULE_REMOVE':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        schedule: team.schedule.filter((e) => e.id !== action.payload),
      }))
    case 'MESSAGE_SEND':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        messages: [
          ...team.messages,
          {
            ...action.payload,
            id: 'm' + Date.now(),
            sentAt: new Date().toISOString(),
            from: action.payload.from ?? 'c1',
            fromName: action.payload.fromName ?? 'Coach Sarah',
            readBy: [],
          },
        ],
      }))
    case 'MESSAGE_MARK_READ':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        messages: team.messages.map((m) =>
          m.id === action.payload.messageId
            ? {
                ...m,
                readBy: (m.readBy || []).includes(action.payload.userId)
                  ? m.readBy
                  : [...(m.readBy || []), action.payload.userId],
              }
            : m
        ),
      }))
    case 'MESSAGE_MARK_ALL_READ':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        messages: team.messages.map((m) => ({
          ...m,
          readBy: (m.readBy || []).includes(action.payload.userId)
            ? m.readBy
            : [...(m.readBy || []), action.payload.userId],
        })),
      }))
    case 'MESSAGE_MARK_UNREAD':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        messages: team.messages.map((m) =>
          m.id === action.payload.messageId ? { ...m, readBy: (m.readBy || []).filter((id) => id !== action.payload.userId) } : m
        ),
      }))
    case 'MESSAGE_REMOVE':
      return updateCurrentTeam(state, (team) => ({
        ...team,
        messages: team.messages.filter((m) => m.id !== action.payload),
      }))
    default:
      return state
  }
}

const TeamContext = createContext(null)

export function TeamProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const saved = loadState()
    if (saved) {
      const migrated = migrateState(saved)
      if (migrated) dispatch({ type: 'LOAD', payload: migrated })
    }
  }, [])

  useEffect(() => {
    saveState(state)
  }, [state])

  const currentTeam = getCurrentTeam(state)
  const value = useMemo(
    () => ({
      ...state,
      currentTeam,
      roster: currentTeam?.roster ?? defaultRoster,
      schedule: currentTeam?.schedule ?? defaultSchedule,
      messages: currentTeam?.messages ?? defaultMessages,
      dispatch,
    }),
    [state, currentTeam]
  )

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeam must be used within TeamProvider')
  return ctx
}
