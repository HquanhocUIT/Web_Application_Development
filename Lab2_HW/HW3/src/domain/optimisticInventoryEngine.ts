import { transitionInventory } from './inventoryMachine.ts'
import { checkoutReservation } from './checkoutWorkflow.ts'
import { expireDueReservations } from './reservationExpiration.ts'
import type { InventoryState, Product } from './flashSale.types'
import type {
  CancelReservationCommand,
  CheckoutCommand,
  InventoryCommandResult,
} from './inventoryMachine.types'
import type { CheckoutWorkflowResult } from './checkoutWorkflow'
import type { ReservationExpirationResult } from './reservationExpiration'
import type {
  InventoryStateMachineTransition,
  OptimisticInventoryLockContract,
  OptimisticInventoryLockFailureReason,
  OptimisticInventoryLockInput,
  OptimisticInventoryLockRequest,
  OptimisticInventoryLockResult,
} from './optimisticInventoryLock.types'

interface StoredRequest {
  fingerprint: string
  promise?: Promise<OptimisticInventoryLockResult>
  result?: OptimisticInventoryLockResult
}

function copyState(state: InventoryState): InventoryState {
  return {
    inventory: { ...state.inventory },
    reservations: state.reservations.map((reservation) => ({ ...reservation })),
  }
}

function copyResult(result: OptimisticInventoryLockResult): OptimisticInventoryLockResult {
  if (result.status === 'reserved') {
    return {
      ...result,
      state: copyState(result.state),
      reservation: { ...result.reservation },
      events: result.events.map((event) => ({ ...event })),
    }
  }

  return { ...result, state: copyState(result.state) }
}

function copyCheckoutResult(result: CheckoutWorkflowResult): CheckoutWorkflowResult {
  return {
    ...result,
    state: copyState(result.state),
    events: result.events.map((event) => ({ ...event })),
  }
}

function copyMachineResult(result: InventoryCommandResult): InventoryCommandResult {
  if (result.status === 'applied') {
    return {
      ...result,
      state: copyState(result.state),
      events: result.events.map((event) => ({ ...event })),
    }
  }

  return { ...result, state: copyState(result.state) }
}

function copyExpirationResult(result: ReservationExpirationResult): ReservationExpirationResult {
  if (result.status === 'rejected') return { ...result, state: copyState(result.state) }

  return {
    ...result,
    state: copyState(result.state),
    expiredReservationIds: [...result.expiredReservationIds],
    events: result.events.map((event) => ({ ...event })),
    failures: result.failures.map((failure) => ({ ...failure })),
  }
}

function requestFingerprint(request: OptimisticInventoryLockRequest): string {
  return JSON.stringify([
    request.reservationId,
    request.productId,
    request.quantity,
    request.expectedVersion,
    request.requestedAt,
    request.reservationExpiresAt,
  ])
}

/** One in-memory product inventory with synchronous compare-and-update sections. */
export class OptimisticInventoryEngine implements OptimisticInventoryLockContract {
  private state: InventoryState
  private readonly product: Product
  private readonly transition: InventoryStateMachineTransition
  private readonly requests = new Map<string, StoredRequest>()

  constructor(
    product: Product,
    initialState: InventoryState,
    transition: InventoryStateMachineTransition = transitionInventory,
  ) {
    this.product = { ...product }
    this.state = copyState(initialState)
    this.transition = transition
  }

  /** Return a snapshot so callers cannot mutate the engine's current state. */
  getState(): InventoryState {
    return copyState(this.state)
  }

  /** Checkout mutates the same in-memory inventory protected by reserve(). */
  checkout(command: CheckoutCommand): CheckoutWorkflowResult {
    const result = checkoutReservation(this.state, this.product, command)
    this.state = copyState(result.state)
    return copyCheckoutResult(result)
  }

  /** Cancel a reservation through the existing inventory state machine. */
  cancelReservation(command: CancelReservationCommand): InventoryCommandResult {
    const result = this.transition({
      product: this.product,
      currentState: this.state,
      command,
    })
    if (result.status === 'applied') this.state = copyState(result.state)
    return copyMachineResult(result)
  }

  /** Expire due reservations in this engine's shared product inventory. */
  expireReservations(nowMs: number): ReservationExpirationResult {
    const result = expireDueReservations(this.state, this.product, nowMs)
    this.state = copyState(result.state)
    return copyExpirationResult(result)
  }

  reserve(input: OptimisticInventoryLockInput): Promise<OptimisticInventoryLockResult> {
    const { request, retryPolicy } = input
    if (!request.requestId?.trim()) {
      return Promise.resolve(this.reject(request, 'invalid_request_id', 0))
    }
    if (!Number.isInteger(retryPolicy.maxAttempts) || retryPolicy.maxAttempts < 1) {
      return Promise.resolve(this.reject(request, 'invalid_retry_policy', 0))
    }

    const fingerprint = requestFingerprint(request)
    const stored = this.requests.get(request.requestId)
    if (stored) {
      if (stored.fingerprint !== fingerprint) {
        return Promise.resolve(this.reject(request, 'request_id_reused', 0))
      }
      if (stored.promise) return stored.promise.then(copyResult)
      if (stored.result) return Promise.resolve(copyResult(stored.result))
    }

    const entry: StoredRequest = { fingerprint }
    const promise = this.process(request, retryPolicy.maxAttempts).then((result) => {
      entry.promise = undefined
      entry.result = copyResult(result)
      return copyResult(result)
    })
    entry.promise = promise
    this.requests.set(request.requestId, entry)
    return promise
  }

  private async process(
    request: OptimisticInventoryLockRequest,
    maxAttempts: number,
  ): Promise<OptimisticInventoryLockResult> {
    const validationFailure = this.validateRequest(request)
    if (validationFailure) return this.reject(request, validationFailure, 0)

    let expectedVersion = request.expectedVersion
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      // Yield before an attempt to let Promise.all callers contend on one version.
      await Promise.resolve()

      const currentVersion = this.state.inventory.version
      if (expectedVersion !== currentVersion) {
        const reason = attempt === 1 && maxAttempts === 1
          ? 'version_conflict'
          : attempt === maxAttempts
            ? 'retry_limit_reached'
            : 'version_conflict'
        if (attempt === maxAttempts) return this.reject(request, reason, attempt)
        expectedVersion = currentVersion
        continue
      }

      // This compare, both pure state-machine transitions, and state assignment
      // are synchronous. There is deliberately no await inside this section.
      const result = this.tryReserve(request, expectedVersion, attempt)
      if (result.status === 'reserved') return result
      if (result.reason !== 'version_conflict') return result
      if (attempt === maxAttempts) {
        const reason = maxAttempts === 1 ? 'version_conflict' : 'retry_limit_reached'
        return this.reject(request, reason, attempt)
      }
      expectedVersion = this.state.inventory.version
    }

    return this.reject(request, 'retry_limit_reached', maxAttempts)
  }

  private validateRequest(
    request: OptimisticInventoryLockRequest,
  ): OptimisticInventoryLockFailureReason | null {
    if (request.productId !== this.product.id) return 'product_mismatch'
    if (!Number.isInteger(request.quantity) || request.quantity <= 0) return 'invalid_quantity'
    if (!Number.isFinite(request.requestedAt) || !Number.isFinite(request.reservationExpiresAt)) {
      return 'invalid_timestamp'
    }
    if (
      request.requestedAt < this.product.saleStartsAt ||
      request.requestedAt >= this.product.saleEndsAt
    ) {
      return 'sale_not_active'
    }
    if (request.reservationExpiresAt <= request.requestedAt) return 'invalid_expiration'
    if (!request.reservationId.trim()) return 'invalid_reservation_status'
    if (this.state.reservations.some((item) => item.id === request.reservationId)) {
      return 'duplicate_reservation'
    }
    return null
  }

  private tryReserve(
    request: OptimisticInventoryLockRequest,
    expectedVersion: number,
    attempts: number,
  ): OptimisticInventoryLockResult {
    const initialState = this.state
    if (expectedVersion !== initialState.inventory.version) {
      return this.reject(request, 'version_conflict', attempts)
    }

    const pending = this.transition({
      product: this.product,
      currentState: initialState,
      command: {
        type: 'request_reservation',
        productId: request.productId,
        reservationId: request.reservationId,
        quantity: request.quantity,
        requestedAt: request.requestedAt,
      },
    })
    if (pending.status === 'rejected') return this.fromMachineFailure(request, pending, attempts)

    const held = this.transition({
      product: this.product,
      currentState: pending.state,
      command: {
        type: 'reserve_inventory',
        reservationId: request.reservationId,
        expectedVersion,
        reservedAt: request.requestedAt,
        expiresAt: request.reservationExpiresAt,
      },
    })
    if (held.status === 'rejected') return this.fromMachineFailure(request, held, attempts)

    this.state = held.state
    const reservation = this.state.reservations.find((item) => item.id === request.reservationId)
    if (!reservation) return this.reject(request, 'reservation_not_found', attempts)

    return {
      status: 'reserved',
      requestId: request.requestId,
      state: copyState(this.state),
      reservation: { ...reservation },
      inventoryVersion: this.state.inventory.version,
      attempts,
      events: [...pending.events, ...held.events],
    }
  }

  private fromMachineFailure(
    request: OptimisticInventoryLockRequest,
    result: Extract<InventoryCommandResult, { status: 'rejected' }>,
    attempts: number,
  ): OptimisticInventoryLockResult {
    return this.reject(request, result.reason, attempts)
  }

  private reject(
    request: OptimisticInventoryLockRequest,
    reason: OptimisticInventoryLockFailureReason,
    attempts: number,
  ): OptimisticInventoryLockResult {
    return {
      status: 'rejected',
      requestId: request?.requestId ?? '',
      state: this.getState(),
      reason,
      currentVersion: this.state.inventory.version,
      attempts,
    }
  }
}
