import { describe, expect, it } from 'vitest'
import { DEV_AIRDROP_TEST_COUNTDOWN_MS, getPubgPhaseConfig } from './pubgPhaseConfig'
import { mockPubgPhase } from './mockArenaData'

describe('PUBG Arena development countdown mode', () => {
  it('sets a stable absolute target ten seconds ahead when explicitly enabled in development', () => {
    const now = 1_700_000_000_000
    const config = getPubgPhaseConfig(mockPubgPhase, true, '?testAirdrop=1', now)

    expect(config.isTestMode).toBe(true)
    expect(config.phase.targetTimestamp).toBe(now + DEV_AIRDROP_TEST_COUNTDOWN_MS)
    expect(config.phase.liveUntilTimestamp).toBeGreaterThan(config.phase.targetTimestamp)
    expect(mockPubgPhase.targetTimestamp).not.toBe(config.phase.targetTimestamp)
  })

  it('keeps the normal phase unchanged in production or without the opt-in query', () => {
    expect(getPubgPhaseConfig(mockPubgPhase, false, '?testAirdrop=1', 10).phase).toBe(mockPubgPhase)
    expect(getPubgPhaseConfig(mockPubgPhase, true, '', 10).phase).toBe(mockPubgPhase)
    expect(getPubgPhaseConfig(mockPubgPhase, true, '?testAirdrop=0', 10).isTestMode).toBe(false)
  })
})
