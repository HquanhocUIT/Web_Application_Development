import { useEffect, useState } from 'react'
import type { PubgPhaseStatus } from './types'

export const PUBGAIRDROP_TICK_MS = 1000

export interface PubgAirdropTimerInput {
  targetTimestamp: number
  liveUntilTimestamp: number
  inventory: number
  serverTimeOffsetMs?: number
}

export interface PubgAirdropTimerSnapshot {
  status: PubgPhaseStatus
  remainingMs: number
  days: number
  hours: number
  minutes: number
  seconds: number
  isClaimable: boolean
  effectiveNow: number
}

export function getPubgAirdropTimerSnapshot(
  now: number,
  { targetTimestamp, liveUntilTimestamp, inventory }: PubgAirdropTimerInput,
): PubgAirdropTimerSnapshot {
  const status: PubgPhaseStatus = now < targetTimestamp
    ? 'WARMUP'
    : now >= liveUntilTimestamp
      ? 'EXPIRED'
      : inventory <= 0
        ? 'LOOTED_OUT'
        : 'AIRDROP_LIVE'

  const remainingMs = Math.max(0, status === 'WARMUP'
    ? targetTimestamp - now
    : status === 'EXPIRED'
      ? 0
      : liveUntilTimestamp - now)
  const totalSeconds = Math.floor(remainingMs / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3_600)
  const minutes = Math.floor((totalSeconds % 3_600) / 60)
  const seconds = totalSeconds % 60

  return {
    status,
    remainingMs,
    days,
    hours,
    minutes,
    seconds,
    isClaimable: status === 'AIRDROP_LIVE',
    effectiveNow: now,
  }
}

export function usePubgAirdropTimer({
  targetTimestamp,
  liveUntilTimestamp,
  inventory,
  serverTimeOffsetMs = 0,
}: PubgAirdropTimerInput): PubgAirdropTimerSnapshot {
  const [now, setNow] = useState(() => Date.now() + serverTimeOffsetMs)

  useEffect(() => {
    const synchronize = () => setNow(Date.now() + serverTimeOffsetMs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') synchronize()
    }

    synchronize()
    const intervalId = window.setInterval(synchronize, PUBGAIRDROP_TICK_MS)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [serverTimeOffsetMs, targetTimestamp, liveUntilTimestamp])

  return getPubgAirdropTimerSnapshot(now, {
    targetTimestamp,
    liveUntilTimestamp,
    inventory,
    serverTimeOffsetMs,
  })
}
