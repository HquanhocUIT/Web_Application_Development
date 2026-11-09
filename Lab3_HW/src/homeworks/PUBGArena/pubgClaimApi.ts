import { mockCrateDrops, mockPubgTickets } from './mockArenaData'

export interface PubgClaimableItem {
  id: string
  name: string
  inventory: number
}

export interface PubgClaimApi {
  getInventory(itemId: string): number
  claim(itemId: string, expectedInventory: number, signal: AbortSignal): Promise<number>
}

export class PubgClaimApiError extends Error {
  readonly status: number
  readonly serverInventory?: number

  constructor(message: string, status: number, serverInventory?: number) {
    super(message)
    this.name = 'PubgClaimApiError'
    this.status = status
    this.serverInventory = serverInventory
  }
}

export class MockPubgClaimApi implements PubgClaimApi {
  private readonly inventory = new Map<string, number>()
  private readonly pendingNetworkErrors: Error[] = []
  private readonly latencyMs: number

  constructor(
    items: readonly PubgClaimableItem[],
    latencyMs = 300,
  ) {
    this.latencyMs = latencyMs
    for (const item of items) this.inventory.set(item.id, Math.max(0, item.inventory))
  }

  getInventory(itemId: string): number {
    return this.inventory.get(itemId) ?? 0
  }

  failNextRequest(error = new Error('Mock network connection failed.')): void {
    this.pendingNetworkErrors.push(error)
  }

  async claim(itemId: string, expectedInventory: number, signal: AbortSignal): Promise<number> {
    await this.delay(signal)
    if (signal.aborted) throw new DOMException('Claim was cancelled.', 'AbortError')

    const networkError = this.pendingNetworkErrors.shift()
    if (networkError) throw networkError

    const serverInventory = this.getInventory(itemId)
    if (!this.inventory.has(itemId) || serverInventory <= 0 || expectedInventory !== serverInventory) {
      throw new PubgClaimApiError('Inventory changed before the claim was processed.', 409, serverInventory)
    }

    const updatedInventory = Math.max(0, serverInventory - 1)
    this.inventory.set(itemId, updatedInventory)
    return updatedInventory
  }

  private delay(signal: AbortSignal): Promise<void> {
    if (signal.aborted) return Promise.reject(new DOMException('Claim was cancelled.', 'AbortError'))
    return new Promise((resolve, reject) => {
      const timerId = window.setTimeout(() => {
        signal.removeEventListener('abort', handleAbort)
        resolve()
      }, this.latencyMs)
      const handleAbort = () => {
        window.clearTimeout(timerId)
        signal.removeEventListener('abort', handleAbort)
        reject(new DOMException('Claim was cancelled.', 'AbortError'))
      }
      signal.addEventListener('abort', handleAbort, { once: true })
    })
  }
}

export const mockPubgClaimableItems: PubgClaimableItem[] = [
  ...(mockCrateDrops.status === 'ready' ? mockCrateDrops.data : []),
  ...(mockPubgTickets.status === 'ready' ? mockPubgTickets.data : []),
]

/** The mock service is the source of truth until a real backend is configured. */
export const pubgClaimApi = new MockPubgClaimApi(mockPubgClaimableItems)
