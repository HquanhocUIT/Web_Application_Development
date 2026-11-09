import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import LeaderboardPanel from './components/LeaderboardPanel'
import RewardGrid from './components/RewardGrid'
import { formatVnd } from './formatVnd'
import type { PubgMockDataState, PubgVnSquadStanding } from './types'

afterEach(() => cleanup())

const claimProps = {
  canClaim: false,
  inventories: { 'test-drop': 2 },
  pendingIds: new Set<string>(),
  messages: [],
  onClaim: async () => undefined,
}

describe('PUBG Arena dashboard states', () => {
  it('shows a loading state while rewards are being fetched', () => {
    render(<RewardGrid drops={{ status: 'loading' }} tickets={{ status: 'ready', data: [] }} {...claimProps} />)
    expect(screen.getByRole('status').textContent).toContain('Loading arena rewards')
  })

  it('shows reward errors and an empty inventory clearly', () => {
    const failed: PubgMockDataState<never> = { status: 'error', message: 'Reward service unavailable.' }
    render(<RewardGrid drops={failed} tickets={{ status: 'empty' }} {...claimProps} />)
    expect(screen.getByRole('alert').textContent).toBe('Reward service unavailable.')
    cleanup()

    render(<RewardGrid drops={{ status: 'empty' }} tickets={{ status: 'empty' }} {...claimProps} />)
    expect(screen.getByRole('status').textContent).toContain('No rewards are available')
  })

  it('shows an empty leaderboard state', () => {
    const empty: PubgMockDataState<PubgVnSquadStanding> = { status: 'empty' }
    render(<LeaderboardPanel standings={empty} />)
    expect(screen.getByRole('status').textContent).toContain('No squad standings')
  })

  it('gates reward controls on the live-phase claim flag', () => {
    const drops = {
      status: 'ready' as const,
      data: [{
        id: 'test-drop',
        name: 'Test Drop',
        subtitle: 'TEST',
        description: 'Test reward',
        priceVnd: 100_000,
        inventory: 2,
        rewardLabel: '500 G-COIN',
        tier: 'RARE' as const,
      }],
    }
    const { rerender } = render(<RewardGrid drops={drops} tickets={{ status: 'empty' }} {...claimProps} />)
    const claimButton = screen.getByRole('button', { name: /Claim Test Drop/ })
    expect(claimButton.hasAttribute('disabled')).toBe(true)

    rerender(<RewardGrid drops={drops} tickets={{ status: 'empty' }} {...claimProps} canClaim />)
    expect(screen.getByRole('button', { name: /Claim Test Drop/ }).hasAttribute('disabled')).toBe(false)
  })

  it('formats VND values using the Vietnamese locale', () => {
    const formatted = formatVnd(1_250_000)
    expect(formatted).toContain('1.250.000')
    expect(formatted).toContain('₫')
  })

  it('filters the squad list by WWCD using the visible controls', () => {
    render(<LeaderboardPanel standings={{ status: 'ready', data: [
      { id: 'one', name: 'One', tag: 'ONE', region: 'Vietnam', wwcd: 1, placementPoints: 10, killPoints: 5 },
      { id: 'two', name: 'Two', tag: 'TWO', region: 'Vietnam', wwcd: 0, placementPoints: 8, killPoints: 7 },
    ] }} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter squads by metric' }), { target: { value: 'wwcd' } })
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('One')).toBeTruthy()
    expect(screen.queryByText('Two')).toBeNull()
    expect(screen.getByLabelText('WWCD 1')).toBeTruthy()
    expect(screen.getByLabelText('Placement points 10')).toBeTruthy()
    expect(screen.getByLabelText('Kill points 5')).toBeTruthy()
    expect(screen.getByText('15')).toBeTruthy()
  })
})
