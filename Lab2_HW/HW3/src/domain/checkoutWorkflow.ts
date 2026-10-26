import type { InventoryState, Product } from './flashSale.types'
import { expireDueReservations } from './reservationExpiration.ts'
import { transitionInventory } from './inventoryMachine.ts'
import type {
  CheckoutCommand,
  InventoryEvent,
  InventoryFailureReason,
} from './inventoryMachine.types'

export type CheckoutWorkflowResult =
  | {
      status: 'completed' | 'payment_declined'
      state: InventoryState
      events: InventoryEvent[]
    }
  | {
      status: 'rejected'
      state: InventoryState
      reason: InventoryFailureReason
      currentVersion: number
      events: InventoryEvent[]
    }

function reject(
  state: InventoryState,
  reason: InventoryFailureReason,
  events: InventoryEvent[] = [],
): CheckoutWorkflowResult {
  return {
    status: 'rejected',
    state,
    reason,
    currentVersion: state.inventory.version,
    events,
  }
}

/** Check out through the existing machine, processing due holds first. */
export function checkoutReservation(
  state: InventoryState,
  product: Product,
  command: CheckoutCommand,
): CheckoutWorkflowResult {
  if (!Number.isFinite(command.checkedOutAt)) {
    return reject(state, 'invalid_timestamp')
  }
  if (command.expectedVersion !== state.inventory.version) {
    return reject(state, 'version_conflict')
  }

  const expiration = expireDueReservations(state, product, command.checkedOutAt)
  if (expiration.status === 'rejected') {
    return reject(state, expiration.reason)
  }
  if (expiration.failures.length > 0) {
    return reject(
      expiration.state,
      expiration.failures[0].reason,
      expiration.events,
    )
  }

  const reservation = expiration.state.reservations.find(
    (item) => item.id === command.reservationId,
  )
  if (!reservation) {
    return reject(expiration.state, 'reservation_not_found', expiration.events)
  }
  if (reservation.status === 'expired') {
    return reject(expiration.state, 'reservation_expired', expiration.events)
  }
  if (reservation.status !== 'reserved') {
    return reject(expiration.state, 'invalid_reservation_status', expiration.events)
  }

  const checkout = transitionInventory({
    product,
    currentState: expiration.state,
    command: {
      ...command,
      expectedVersion: expiration.state.inventory.version,
    },
  })
  if (checkout.status === 'rejected') {
    return reject(expiration.state, checkout.reason, expiration.events)
  }

  const status = command.paymentStatus === 'approved' ? 'completed' : 'payment_declined'
  return {
    status,
    state: checkout.state,
    events: [...expiration.events, ...checkout.events],
  }
}
