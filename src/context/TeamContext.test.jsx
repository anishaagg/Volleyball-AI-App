import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { reducer, initialState, TeamProvider, useTeam } from './TeamContext.jsx'

// --- Unit tests: reducer (TeamContext state logic) ---
describe('TeamContext reducer', () => {
  it('returns initial state for unknown action', () => {
    const next = reducer(initialState, { type: 'UNKNOWN' })
    expect(next).toEqual(initialState)
  })

  it('LOAD migrates old single-team payload to multi-team', () => {
    const payload = { roster: { teamPhotoUrl: 'https://example.com/team.jpg', coaches: [], players: [] } }
    const next = reducer(initialState, { type: 'LOAD', payload })
    expect(next.teams).toHaveLength(1)
    expect(next.teams[0].roster.teamPhotoUrl).toBe('https://example.com/team.jpg')
    expect(next.currentTeamId).toBe('t1')
  })

  it('ROSTER_UPDATE_COACH updates coach by id on current team', () => {
    const next = reducer(initialState, {
      type: 'ROSTER_UPDATE_COACH',
      payload: { id: 'c1', description: 'I focus on fundamentals.' },
    })
    const team = next.teams.find((t) => t.id === next.currentTeamId)
    const coach = team.roster.coaches.find((c) => c.id === 'c1')
    expect(coach.description).toBe('I focus on fundamentals.')
  })

  it('ROSTER_SET_TEAM_PHOTO sets team photo URL on current team', () => {
    const next = reducer(initialState, { type: 'ROSTER_SET_TEAM_PHOTO', payload: 'https://team.jpg' })
    const team = next.teams.find((t) => t.id === next.currentTeamId)
    expect(team.roster.teamPhotoUrl).toBe('https://team.jpg')
  })

  it('SCHEDULE_ADD appends an event to current team', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T12:00:00'))
    const event = { type: 'practice', title: 'Test', date: '2026-03-01', time: '18:00' }
    const next = reducer(initialState, { type: 'SCHEDULE_ADD', payload: event })
    const team = next.teams.find((t) => t.id === next.currentTeamId)
    expect(team.schedule.length).toBe(initialState.teams[0].schedule.length + 1)
    const added = team.schedule.find((e) => e.title === 'Test')
    expect(added).toBeDefined()
    expect(added.date).toBe('2026-03-01')
    vi.useRealTimers()
  })

  it('SCHEDULE_UPDATE updates event by id', () => {
    const next = reducer(initialState, {
      type: 'SCHEDULE_UPDATE',
      payload: { id: 'e1', title: 'Updated Practice' },
    })
    const team = next.teams.find((t) => t.id === next.currentTeamId)
    const updated = team.schedule.find((e) => e.id === 'e1')
    expect(updated.title).toBe('Updated Practice')
  })

  it('SCHEDULE_REMOVE removes event by id', () => {
    const next = reducer(initialState, { type: 'SCHEDULE_REMOVE', payload: 'e1' })
    const team = next.teams.find((t) => t.id === next.currentTeamId)
    expect(team.schedule.some((e) => e.id === 'e1')).toBe(false)
  })

  it('MESSAGE_SEND appends a message to current team', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-10T10:00:00'))
    const next = reducer(initialState, {
      type: 'MESSAGE_SEND',
      payload: { to: 'all', toName: 'All', subject: 'Hi', body: 'Hello' },
    })
    const team = next.teams.find((t) => t.id === next.currentTeamId)
    expect(team.messages.length).toBe(initialState.teams[0].messages.length + 1)
    const last = team.messages[team.messages.length - 1]
    expect(last.subject).toBe('Hi')
    expect(last.fromName).toBe('Coach Sarah')
    vi.useRealTimers()
  })

  it('TEAM_ADD adds a new team and switches to it', () => {
    const next = reducer(initialState, { type: 'TEAM_ADD', payload: { name: 'JV' } })
    expect(next.teams).toHaveLength(3)
    expect(next.currentTeamId).not.toBe('t1')
    const newTeam = next.teams.find((t) => t.id === next.currentTeamId)
    expect(newTeam.name).toBe('JV')
  })

  it('TEAM_SWITCH updates currentTeamId', () => {
    const withTwo = reducer(initialState, { type: 'TEAM_ADD', payload: { name: 'JV' } })
    const secondId = withTwo.teams[1].id
    const next = reducer(withTwo, { type: 'TEAM_SWITCH', payload: secondId })
    expect(next.currentTeamId).toBe(secondId)
  })
})

// --- Integration test: provider and useTeam ---
function TestConsumer() {
  const { roster, schedule, messages, dispatch } = useTeam()
  return (
    <div>
      <span data-testid="coach-count">{roster.coaches.length}</span>
      <span data-testid="player-count">{roster.players.length}</span>
      <span data-testid="schedule-count">{schedule.length}</span>
      <span data-testid="messages-count">{messages.length}</span>
      <button
        data-testid="add-event"
        onClick={() => dispatch({ type: 'SCHEDULE_ADD', payload: { type: 'game', title: 'Test Game', date: '2026-06-01' } })}
      >
        Add event
      </button>
    </div>
  )
}

describe('TeamContext provider and useTeam', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides initial roster, schedule, and messages from current team', () => {
    render(
      <TeamProvider>
        <TestConsumer />
      </TeamProvider>
    )
    const team = initialState.teams[0]
    expect(screen.getByTestId('coach-count').textContent).toBe(String(team.roster.coaches.length))
    expect(screen.getByTestId('player-count').textContent).toBe(String(team.roster.players.length))
    expect(screen.getByTestId('schedule-count').textContent).toBe(String(team.schedule.length))
    expect(screen.getByTestId('messages-count').textContent).toBe(String(team.messages.length))
  })

  it('dispatch SCHEDULE_ADD updates schedule', async () => {
    render(
      <TeamProvider>
        <TestConsumer />
      </TeamProvider>
    )
    const before = initialState.teams[0].schedule.length
    const addButtons = screen.getAllByTestId('add-event')
    addButtons[0].click()
    await waitFor(() => {
      const counts = screen.getAllByTestId('schedule-count')
      const after = Number(counts[0].textContent)
      expect(after).toBe(before + 1)
    })
  })
})
