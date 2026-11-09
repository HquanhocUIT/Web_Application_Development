import type { PubgPhase } from './types'

export const DEV_AIRDROP_TEST_QUERY_PARAM = 'testAirdrop'
export const DEV_AIRDROP_TEST_COUNTDOWN_MS = 10_000
const TEST_LIVE_WINDOW_MS = 60 * 60 * 1000

export interface PubgPhaseConfig {
  phase: PubgPhase
  isTestMode: boolean
}

export function getPubgPhaseConfig(
  phase: PubgPhase,
  isDevelopment: boolean,
  search: string,
  now: number,
): PubgPhaseConfig {
  const isTestMode = isDevelopment
    && new URLSearchParams(search).get(DEV_AIRDROP_TEST_QUERY_PARAM) === '1'

  if (!isTestMode) return { phase, isTestMode: false }

  const targetTimestamp = now + DEV_AIRDROP_TEST_COUNTDOWN_MS
  return {
    phase: {
      ...phase,
      targetTimestamp,
      liveUntilTimestamp: targetTimestamp + TEST_LIVE_WINDOW_MS,
    },
    isTestMode: true,
  }
}
