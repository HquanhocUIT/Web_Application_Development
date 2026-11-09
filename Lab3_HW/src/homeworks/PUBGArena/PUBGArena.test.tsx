import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import LeaderboardPanel from './components/LeaderboardPanel'
import RewardGrid from './components/RewardGrid'
import { formatVnd } from './formatVnd'
import type { PubgMockDataState, PubgVnSquadStanding } from './types'

afterEach(() => cleanup())

describe('PUBG Arena dashboard states', () => {
  it('shows a loading state while rewards are being fetched', () => {
    render(<RewardGrid drops={{ status: 'loading' }} tickets={{ status: 'ready', data: [] }} canClaim={false} />)
    expect(screen.getByRole('status').textContent).toContain('Loading arena rewards')
  })

  it('shows reward errors and an empty inventory clearly', () => {
    const failed: PubgMockDataState<never> = { status: 'error', message: 'Reward service unavailable.' }
    render(<RewardGrid drops={failed} tickets={{ status: 'empty' }} canClaim={false} />)
    expect(screen.getByRole('alert').textContent).toBe('Reward service unavailable.')
    cleanup()

    render(<RewardGrid drops={{ status: 'empty' }} tickets={{ status: 'empty' }} canClaim={false} />)
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
    const { rerender } = render(<RewardGrid drops={drops} tickets={{ status: 'empty' }} canClaim={false} />)
    const claimButton = screen.getByRole('button', { name: /Claim Test Drop/ })
    expect(claimButton.hasAttribute('disabled')).toBe(true)

    rerender(<RewardGrid drops={drops} tickets={{ status: 'empty' }} canClaim />)
    expect(screen.getByRole('button', { name: /Claim Test Drop/ }).hasAttribute('disabled')).toBe(false)
  })

  it('formats VND values using the Vietnamese locale', () => {
    const formatted = formatVnd(1_250_000)
    expect(formatted).toContain('1.250.000')
    expect(formatted).toContain('₫')
  })
})
