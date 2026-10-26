import type {
  CheckoutCommand,
  CancelReservationCommand,
  InventoryCommandResult,
  InventoryEvent,
  InventoryMachineInput,
  InventoryFailureReason,
} from './inventoryMachine.types'
import type { CheckoutWorkflowResult } from './checkoutWorkflow'
import type { ReservationExpirationResult } from './reservationExpiration'
import type { InventoryState, Reservation } from './flashSale.types'

/** One buyer's request to reserve a product against the inventory version read. */
export interface OptimisticInventoryLockRequest {
  requestId: string
  reservationId: string
  productId: string
  quantity: number
  expectedVersion: number
  requestedAt: number
  reservationExpiresAt: number
}

/** maxAttempts includes the original attempt; it must be a positive integer. */
export interface OptimisticRetryPolicy {
  maxAttempts: number
}

export interface OptimisticInventoryLockInput {
  request: OptimisticInventoryLockRequest
  retryPolicy: OptimisticRetryPolicy
}

export type InventoryStateMachineTransition = (
  input: InventoryMachineInput,
) => InventoryCommandResult

export type OptimisticInventoryLockFailureReason =
  | InventoryFailureReason
  | 'retry_limit_reached'
  | 'invalid_request_id'
  | 'request_id_reused'
  | 'invalid_retry_policy'

export type OptimisticInventoryLockResult =
  | {
      status: 'reserved'
      requestId: string
      state: InventoryState
      reservation: Reservation
      inventoryVersion: number
      attempts: number
      events: InventoryEvent[]
    }
  | {
      status: 'rejected'
      requestId: string
      state: InventoryState
      reason: OptimisticInventoryLockFailureReason
      currentVersion: number
      attempts: number
    }

/**
 * Contract for the future lock manager implementation:
 *
 * - Compare request.expectedVersion with currentState.inventory.version before
 *   applying a reservation; a mismatch must not publish or mutate state.
 * - Delegate pending/reserved transitions to transitionInventory. Publish the
 *   resulting state only if the reservation request and hold both succeed.
 * - Each successful hold uses the state machine's version increment. Retry
 *   only a version conflict, by reading the latest in-memory state and using
 *   its version, up to retryPolicy.maxAttempts total attempts. Do not retry an
 *   insufficient-stock or invalid-request result.
 * - Return retry_limit_reached after the bounded attempts are exhausted.
 * - Calls are serialized by JavaScript in this one running engine. This
 *   frontend contract does not provide atomic coordination across devices,
 *   browsers, servers, or database processes.
 */
export interface OptimisticInventoryLockContract {
  getState(): InventoryState
  reserve(input: OptimisticInventoryLockInput): Promise<OptimisticInventoryLockResult>
  checkout(command: CheckoutCommand): CheckoutWorkflowResult
  cancelReservation(command: CancelReservationCommand): InventoryCommandResult
  expireReservations(nowMs: number): ReservationExpirationResult
}
