import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { MockPubgClaimApi } from './pubgClaimApi'
import { usePubgAirdropClaims } from './usePubgAirdropClaims'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('usePubgAirdropClaims', () => {
  it('updates inventory optimistically, prevents rapid duplicates and reconciles success', async () => {
    const items = [{ id: 'vip', name: 'VIP pass', inventory: 2 }]
    const api = new MockPubgClaimApi(items, 10)
    const claimSpy = vi.spyOn(api, 'claim')
    const { result } = renderHook(() => usePubgAirdropClaims(items, api))
    let firstRequest: Promise<void> | undefined
    let duplicateRequest: Promise<void> | undefined

    act(() => {
      firstRequest = result.current.claim('vip')
      duplicateRequest = result.current.claim('vip')
    })
    expect(result.current.inventories.vip).toBe(1)
    expect(result.current.pendingIds.has('vip')).toBe(true)
    expect(claimSpy).toHaveBeenCalledOnce()

    await act(async () => Promise.all([firstRequest, duplicateRequest]))
    expect(result.current.inventories.vip).toBe(1)
    expect(api.getInventory('vip')).toBe(1)
    expect(result.current.pendingIds.has('vip')).toBe(false)
    expect(result.current.messages[0]).toMatchObject({ kind: 'success', text: expect.stringContaining('VIP pass claimed') })
  })

  it('rolls a stale optimistic count back to the 409 authoritative inventory', async () => {
    const items = [{ id: 'crate', name: 'G-Coin crate', inventory: 3 }]
    const api = new MockPubgClaimApi(items, 0)
    await api.claim('crate', 3, new AbortController().signal)
    await api.claim('crate', 2, new AbortController().signal)
    await api.claim('crate', 1, new AbortController().signal)

    const { result } = renderHook(() => usePubgAirdropClaims(items, api))
    expect(result.current.inventories.crate).toBe(0)
    // Simulate a client that cached 3 before another client depleted the server stock.
    const staleApi = {
      getInventory: () => 3,
      claim: (itemId: string, expected: number, signal: AbortSignal) => api.claim(itemId, expected, signal),
    }
    const stale = renderHook(() => usePubgAirdropClaims(items, staleApi))
    expect(stale.result.current.inventories.crate).toBe(3)

    let request: Promise<void> | undefined
    act(() => { request = stale.result.current.claim('crate') })
    expect(stale.result.current.inventories.crate).toBe(2)
    await act(async () => request)
    expect(stale.result.current.inventories.crate).toBe(0)
    expect(stale.result.current.messages[0]?.kind).toBe('error')
    expect(stale.result.current.messages[0]?.text).toContain('0 available')
  })

  it('restores optimistic inventory after a network failure', async () => {
    const items = [{ id: 'ticket', name: 'Entry ticket', inventory: 2 }]
    const api = new MockPubgClaimApi(items, 0)
    api.failNextRequest(new Error('offline'))
    const { result } = renderHook(() => usePubgAirdropClaims(items, api))
    let request: Promise<void> | undefined

    act(() => { request = result.current.claim('ticket') })
    expect(result.current.inventories.ticket).toBe(1)
    await act(async () => request)
    expect(result.current.inventories.ticket).toBe(2)
    expect(api.getInventory('ticket')).toBe(2)
    expect(result.current.messages[0]).toMatchObject({ kind: 'error' })
  })

  it('keeps simultaneous distinct claims consistent with the API inventory', async () => {
    const items = [
      { id: 'vip', name: 'VIP pass', inventory: 1 },
      { id: 'crate', name: 'Supply crate', inventory: 2 },
    ]
    const api = new MockPubgClaimApi(items, 5)
    const { result } = renderHook(() => usePubgAirdropClaims(items, api))
    let vipRequest: Promise<void> | undefined
    let crateRequest: Promise<void> | undefined

    act(() => {
      vipRequest = result.current.claim('vip')
      crateRequest = result.current.claim('crate')
    })
    expect(result.current.inventories).toMatchObject({ vip: 0, crate: 1 })
    await act(async () => Promise.all([vipRequest, crateRequest]))
    expect(result.current.inventories).toMatchObject({ vip: 0, crate: 1 })
    expect(api.getInventory('vip')).toBe(0)
    expect(api.getInventory('crate')).toBe(1)
  })

  it('cancels pending claims and prevents a stale response overwriting a newer claim', async () => {
    const items = [{ id: 'vip', name: 'VIP pass', inventory: 2 }]
    const api = new MockPubgClaimApi(items, 25)
    const { result } = renderHook(() => usePubgAirdropClaims(items, api))
    let cancelled: Promise<void> | undefined
    act(() => { cancelled = result.current.claim('vip') })
    expect(result.current.inventories.vip).toBe(1)
    act(() => result.current.cancelClaim('vip'))
    expect(result.current.inventories.vip).toBe(2)

    let newer: Promise<void> | undefined
    act(() => { newer = result.current.claim('vip') })
    await act(async () => Promise.all([cancelled, newer]))

    expect(result.current.inventories.vip).toBe(1)
    expect(api.getInventory('vip')).toBe(1)
    expect(result.current.messages).toHaveLength(1)
  })

  it('aborts pending requests on unmount without changing server inventory', async () => {
    const items = [{ id: 'ticket', name: 'Ticket', inventory: 1 }]
    const api = new MockPubgClaimApi(items, 100)
    const { result, unmount } = renderHook(() => usePubgAirdropClaims(items, api))
    let request: Promise<void> | undefined
    act(() => { request = result.current.claim('ticket') })
    unmount()
    await request
    expect(api.getInventory('ticket')).toBe(1)
  })
})
