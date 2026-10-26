import type { InventoryState, Product } from './flashSale.types'
import { transitionInventory } from './inventoryMachine.ts'
import type {
  InventoryEvent,
  InventoryFailureReason,
} from './inventoryMachine.types'

export interface ReservationExpirationFailure {
  reservationId: string
  reason: InventoryFailureReason
}

export type ReservationExpirationResult =
  | {
      status: 'processed'
      state: InventoryState
      expiredReservationIds: string[]
      events: InventoryEvent[]
      failures: ReservationExpirationFailure[]
    }
  | {
      status: 'rejected'
      state: InventoryState
      reason: 'invalid_timestamp'
    }

/** Expire all currently due reservations through the inventory state machine. */
export function expireDueReservations(
  state: InventoryState,
  product: Product,
  nowMs: number,
): ReservationExpirationResult {
  if (!Number.isFinite(nowMs)) {
    return { status: 'rejected', state, reason: 'invalid_timestamp' }
  }

  let currentState = state
  const expiredReservationIds: string[] = []
  const events: InventoryEvent[] = []
  const failures: ReservationExpirationFailure[] = []

  for (const reservation of state.reservations) {
    if (
      reservation.status !== 'reserved' ||
      reservation.expiresAt === null ||
      reservation.expiresAt > nowMs
    ) {
      continue
    }

    const result = transitionInventory({
      product,
      currentState,
      command: {
        type: 'expire_reservation',
        reservationId: reservation.id,
        expectedVersion: currentState.inventory.version,
        checkedAt: nowMs,
      },
    })

    if (result.status === 'applied') {
      currentState = result.state
      expiredReservationIds.push(reservation.id)
      events.push(...result.events)
    } else {
      failures.push({ reservationId: reservation.id, reason: result.reason })
    }
  }

  return {
    status: 'processed',
    state: currentState,
    expiredReservationIds,
    events,
    failures,
  }
}
