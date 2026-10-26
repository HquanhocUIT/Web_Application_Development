import type { InventoryState, Product } from './flashSale.types'

/** Commands describe requested transitions; this file defines contracts only. */
export interface RequestReservationCommand {
  type: 'request_reservation'
  productId: string
  reservationId: string
  quantity: number
  requestedAt: number
}

export interface ReserveInventoryCommand {
  type: 'reserve_inventory'
  reservationId: string
  expectedVersion: number
  reservedAt: number
  expiresAt: number
}

export interface CancelReservationCommand {
  type: 'cancel_reservation'
  reservationId: string
  expectedVersion: number
  cancelledAt: number
}

export interface ExpireReservationCommand {
  type: 'expire_reservation'
  reservationId: string
  expectedVersion: number
  checkedAt: number
}

export interface CheckoutCommand {
  type: 'checkout'
  reservationId: string
  expectedVersion: number
  checkedOutAt: number
  /** Payment outcome is simulated by the frontend exercise. */
  paymentStatus: 'approved' | 'declined'
}

export type InventoryCommand =
  | RequestReservationCommand
  | ReserveInventoryCommand
  | CancelReservationCommand
  | ExpireReservationCommand
  | CheckoutCommand

export type InventoryFailureReason =
  | 'invalid_quantity'
  | 'insufficient_stock'
  | 'sale_not_active'
  | 'version_conflict'
  | 'reservation_not_found'
  | 'invalid_reservation_status'
  | 'reservation_expired'
  | 'invalid_expiration'
  | 'reservation_not_expired'
  | 'duplicate_reservation'
  | 'invalid_inventory'
  | 'product_mismatch'
  | 'invalid_timestamp'

export type InventoryEvent =
  | {
      type: 'reservation_requested'
      reservationId: string
      quantity: number
      occurredAt: number
    }
  | {
      type: 'inventory_reserved'
      reservationId: string
      quantity: number
      expiresAt: number
      inventoryVersion: number
    }
  | {
      type: 'reservation_cancelled'
      reservationId: string
      quantityReleased: number
      occurredAt: number
    }
  | {
      type: 'reservation_expired'
      reservationId: string
      quantityReleased: number
      occurredAt: number
    }
  | {
      type: 'checkout_completed'
      reservationId: string
      quantitySold: number
      inventoryVersion: number
      occurredAt: number
    }
  | {
      type: 'checkout_failed'
      reservationId: string
      quantityReleased: number
      reason: 'payment_declined'
      occurredAt: number
    }

export type InventoryCommandResult =
  | {
      status: 'applied'
      state: InventoryState
      events: InventoryEvent[]
    }
  | {
      status: 'rejected'
      state: InventoryState
      reason: InventoryFailureReason
      currentVersion: number
    }

/**
 * State-machine invariants for the implementation task:
 *
 * - available = totalQuantity - soldQuantity - reservedQuantity.
 * - Quantities are whole and non-negative; sold + reserved never exceeds total.
 * - Only a pending reservation can become reserved or cancelled.
 * - Reserving requires an active sale, a positive integer quantity, enough
 *   available stock, expiresAt after reservedAt, and a matching version.
 * - Only a reserved, unexpired reservation can check out. Successful checkout
 *   moves quantity from reserved to sold; a declined payment cancels and
 *   releases it. A checked-out reservation cannot be checked out again.
 * - Cancellation and expiration release reserved quantity once. Expiration is
 *   valid only at or after expiresAt; expired reservations cannot check out.
 * - Inventory mutations require expectedVersion to match. A mismatch is
 *   rejected with the current version and never silently overwrites state.
 * - Terminal statuses (expired, checked_out, cancelled) cannot be reused.
 *
 * Transitions: pending -> reserved | cancelled; reserved -> checked_out |
 * expired | cancelled. A rejected command leaves state unchanged.
 */
/** Input accepted by the future state-machine transition function. */
export interface InventoryMachineInput {
  command: InventoryCommand
  currentState: InventoryState
  product: Product
}
