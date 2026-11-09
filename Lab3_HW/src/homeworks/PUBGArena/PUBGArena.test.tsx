import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import LeaderboardPanel from './components/LeaderboardPanel'
import RewardGrid from './components/RewardGrid'
import { formatVnd } from './formatVnd'
import type { PubgMockDataState, PubgVnSquadStanding } from './types'

afterEach(() => cleanup())

describe('PUBG Arena dashboard states', () => {
  it('shows a loading state while rewards are being fetched', () => {
    render(<RewardGrid drops={{ status: 'loading' }} tickets={{ status: 'ready', data: [] }} />)
    expect(screen.getByRole('status').textContent).toContain('Loading arena rewards')
  })

  it('shows reward errors and an empty inventory clearly', () => {
    const failed: PubgMockDataState<never> = { status: 'error', message: 'Reward service unavailable.' }
    render(<RewardGrid drops={failed} tickets={{ status: 'empty' }} />)
    expect(screen.getByRole('alert').textContent).toBe('Reward service unavailable.')
    cleanup()

    render(<RewardGrid drops={{ status: 'empty' }} tickets={{ status: 'empty' }} />)
    expect(screen.getByRole('status').textContent).toContain('No rewards are available')
  })

  it('shows an empty leaderboard state', () => {
    const empty: PubgMockDataState<PubgVnSquadStanding> = { status: 'empty' }
    render(<LeaderboardPanel standings={empty} />)
    expect(screen.getByRole('status').textContent).toContain('No squad standings')
  })

  it('formats VND values using the Vietnamese locale', () => {
    const formatted = formatVnd(1_250_000)
    expect(formatted).toContain('1.250.000')
    expect(formatted).toContain('₫')
  })
})
