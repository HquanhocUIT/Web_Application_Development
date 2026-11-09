import { describe, expect, it } from 'vitest'
import { MockPubgClaimApi, PubgClaimApiError } from './pubgClaimApi'

describe('MockPubgClaimApi', () => {
  it('returns authoritative inventory after a successful claim', async () => {
    const api = new MockPubgClaimApi([{ id: 'vip', name: 'VIP ticket', inventory: 2 }], 0)
    const result = await api.claim('vip', 2, new AbortController().signal)
    expect(result).toBe(1)
    expect(api.getInventory('vip')).toBe(1)
  })

  it('returns HTTP 409 and authoritative inventory for stale claims', async () => {
    const api = new MockPubgClaimApi([{ id: 'crate', name: 'G-Coin crate', inventory: 3 }], 0)
    const signal = new AbortController().signal
    await api.claim('crate', 3, signal)
    await api.claim('crate', 2, signal)
    await api.claim('crate', 1, signal)

    const conflict = api.claim('crate', 3, signal)
    await expect(conflict).rejects.toBeInstanceOf(PubgClaimApiError)
    await expect(conflict).rejects.toMatchObject({ status: 409, serverInventory: 0 })
    expect(api.getInventory('crate')).toBe(0)
  })

  it('serializes simultaneous claims against a shared inventory', async () => {
    const api = new MockPubgClaimApi([{ id: 'last-ticket', name: 'Last ticket', inventory: 1 }], 1)
    const results = await Promise.allSettled([
      api.claim('last-ticket', 1, new AbortController().signal),
      api.claim('last-ticket', 1, new AbortController().signal),
    ])

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    const rejected = results.find((result) => result.status === 'rejected')
    expect(rejected?.status === 'rejected' && rejected.reason).toMatchObject({ status: 409, serverInventory: 0 })
    expect(api.getInventory('last-ticket')).toBe(0)
  })

  it('leaves authoritative inventory unchanged on a network failure', async () => {
    const api = new MockPubgClaimApi([{ id: 'ticket', name: 'Ticket', inventory: 2 }], 0)
    api.failNextRequest()
    await expect(api.claim('ticket', 2, new AbortController().signal)).rejects.toThrow('Mock network connection failed')
    expect(api.getInventory('ticket')).toBe(2)
  })

  it('aborts a delayed request before it can modify server inventory', async () => {
    const api = new MockPubgClaimApi([{ id: 'crate', name: 'Crate', inventory: 2 }], 50)
    const controller = new AbortController()
    const request = api.claim('crate', 2, controller.signal)
    controller.abort()
    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
    expect(api.getInventory('crate')).toBe(2)
  })
})
