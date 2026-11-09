import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { usePubgAirdropTimer } from './usePubgAirdropTimer'

const targetTimestamp = 5_000
const liveUntilTimestamp = 15_000

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(0))
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('usePubgAirdropTimer', () => {
  it('counts down from an absolute target and enters the live phase at zero', () => {
    const { result } = renderHook(() => usePubgAirdropTimer({
      targetTimestamp,
      liveUntilTimestamp,
      inventory: 4,
    }))

    expect(result.current).toMatchObject({ status: 'WARMUP', remainingMs: 5_000, days: 0, hours: 0, minutes: 0, seconds: 5, isClaimable: false })
    act(() => vi.advanceTimersByTime(4_000))
    expect(result.current).toMatchObject({ status: 'WARMUP', remainingMs: 1_000, seconds: 1 })
    act(() => vi.advanceTimersByTime(1_000))
    expect(result.current).toMatchObject({ status: 'AIRDROP_LIVE', remainingMs: 10_000, isClaimable: true })
  })

  it('synchronizes immediately when a hidden tab becomes visible', () => {
    const visibility = vi.spyOn(document, 'visibilityState', 'get')
    const { result } = renderHook(() => usePubgAirdropTimer({
      targetTimestamp,
      liveUntilTimestamp,
      inventory: 2,
    }))

    visibility.mockReturnValue('hidden')
    vi.setSystemTime(new Date(targetTimestamp + 2_000))
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current.status).toBe('WARMUP')

    visibility.mockReturnValue('visible')
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(result.current).toMatchObject({ status: 'AIRDROP_LIVE', remainingMs: 8_000, seconds: 8 })
  })

  it('never shows negative time and transitions to expired at the closing timestamp', () => {
    const { result } = renderHook(() => usePubgAirdropTimer({
      targetTimestamp: 1_000,
      liveUntilTimestamp: 3_000,
      inventory: 1,
    }))

    act(() => vi.advanceTimersByTime(5_000))
    expect(result.current).toMatchObject({ status: 'EXPIRED', remainingMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isClaimable: false })
  })

  it('marks a live drop as looted out and prevents claiming when inventory is empty', () => {
    vi.setSystemTime(new Date(6_000))
    const { result } = renderHook(() => usePubgAirdropTimer({
      targetTimestamp,
      liveUntilTimestamp,
      inventory: 0,
    }))

    expect(result.current).toMatchObject({ status: 'LOOTED_OUT', remainingMs: 9_000, isClaimable: false })
  })

  it('applies server time offset when evaluating the phase and remaining time', () => {
    vi.setSystemTime(new Date(1_000))
    const { result } = renderHook(() => usePubgAirdropTimer({
      targetTimestamp: 5_000,
      liveUntilTimestamp: 15_000,
      inventory: 1,
      serverTimeOffsetMs: 6_000,
    }))

    expect(result.current).toMatchObject({ status: 'AIRDROP_LIVE', effectiveNow: 7_000, remainingMs: 8_000, isClaimable: true })
  })

  it('clears its interval and visibility listener on unmount', () => {
    const removeListener = vi.spyOn(document, 'removeEventListener')
    const { unmount } = renderHook(() => usePubgAirdropTimer({
      targetTimestamp,
      liveUntilTimestamp,
      inventory: 1,
    }))

    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
    expect(removeListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })
})
