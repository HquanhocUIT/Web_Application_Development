import type {
  InventoryCommand,
  InventoryCommandResult,
  InventoryEvent,
  InventoryFailureReason,
  InventoryMachineInput,
} from './inventoryMachine.types'
import type { Inventory, InventoryState, Product, Reservation } from './flashSale.types'

function reject(
  state: InventoryState,
  reason: InventoryFailureReason,
): InventoryCommandResult {
  return {
    status: 'rejected',
    state,
    reason,
    currentVersion: state.inventory.version,
  }
}

function isWholeNonNegative(value: number): boolean {
  return Number.isInteger(value) && value >= 0
}

function isValidContext(state: InventoryState, product: Product): boolean {
  const { inventory, reservations } = state
  if (
    inventory.productId !== product.id ||
    !Number.isFinite(product.saleStartsAt) ||
    !Number.isFinite(product.saleEndsAt) ||
    product.saleEndsAt <= product.saleStartsAt ||
    !isWholeNonNegative(inventory.totalQuantity) ||
    !isWholeNonNegative(inventory.soldQuantity) ||
    !isWholeNonNegative(inventory.reservedQuantity) ||
    !isWholeNonNegative(inventory.version) ||
    inventory.soldQuantity + inventory.reservedQuantity > inventory.totalQuantity
  ) {
    return false
  }

  const reservationIds = new Set<string>()
  let reservedFromRecords = 0
  for (const reservation of reservations) {
    if (
      reservation.productId !== inventory.productId ||
      reservationIds.has(reservation.id) ||
      !Number.isInteger(reservation.quantity) ||
      reservation.quantity <= 0
    ) {
      return false
    }
    reservationIds.add(reservation.id)
    if (reservation.status === 'reserved') reservedFromRecords += reservation.quantity
  }

  return reservedFromRecords === inventory.reservedQuantity
}

function findReservation(
  state: InventoryState,
  reservationId: string,
): Reservation | undefined {
  return state.reservations.find((reservation) => reservation.id === reservationId)
}

function applied(state: InventoryState, events: InventoryEvent[]): InventoryCommandResult {
  return { status: 'applied', state, events }
}

function nextState(
  state: InventoryState,
  inventory: Inventory,
  reservation: Reservation,
): InventoryState {
  return {
    inventory,
    reservations: state.reservations.map((item) =>
      item.id === reservation.id ? reservation : item,
    ),
  }
}

function applyRequest(
  state: InventoryState,
  command: Extract<InventoryCommand, { type: 'request_reservation' }>,
): InventoryCommandResult {
  if (!Number.isInteger(command.quantity) || command.quantity <= 0) {
    return reject(state, 'invalid_quantity')
  }
  if (!Number.isFinite(command.requestedAt)) return reject(state, 'invalid_timestamp')
  if (!command.reservationId.trim()) return reject(state, 'invalid_reservation_status')
  if (findReservation(state, command.reservationId)) {
    return reject(state, 'duplicate_reservation')
  }

  const reservation: Reservation = {
    id: command.reservationId,
    productId: command.productId,
    quantity: command.quantity,
    status: 'pending',
    createdAt: command.requestedAt,
    expiresAt: null,
    updatedAt: command.requestedAt,
    inventoryVersion: state.inventory.version,
  }
  const next: InventoryState = {
    inventory: state.inventory,
    reservations: [...state.reservations, reservation],
  }
  return applied(next, [{
    type: 'reservation_requested',
    reservationId: reservation.id,
    quantity: reservation.quantity,
    occurredAt: command.requestedAt,
  }])
}

function applyReserve(
  state: InventoryState,
  product: Product,
  command: Extract<InventoryCommand, { type: 'reserve_inventory' }>,
): InventoryCommandResult {
  if (!Number.isFinite(command.reservedAt) || !Number.isFinite(command.expiresAt)) {
    return reject(state, 'invalid_timestamp')
  }
  if (command.expectedVersion !== state.inventory.version) {
    return reject(state, 'version_conflict')
  }
  const reservation = findReservation(state, command.reservationId)
  if (!reservation) return reject(state, 'reservation_not_found')
  if (reservation.status !== 'pending') return reject(state, 'invalid_reservation_status')
  if (command.reservedAt < product.saleStartsAt || command.reservedAt >= product.saleEndsAt) {
    return reject(state, 'sale_not_active')
  }
  if (command.expiresAt <= command.reservedAt) return reject(state, 'invalid_expiration')

  const availableQuantity =
    state.inventory.totalQuantity -
    state.inventory.soldQuantity -
    state.inventory.reservedQuantity
  if (reservation.quantity > availableQuantity) return reject(state, 'insufficient_stock')

  const version = state.inventory.version + 1
  const updatedReservation: Reservation = {
    ...reservation,
    status: 'reserved',
    expiresAt: command.expiresAt,
    updatedAt: command.reservedAt,
    inventoryVersion: version,
  }
  const nextInventory: Inventory = {
    ...state.inventory,
    reservedQuantity: state.inventory.reservedQuantity + reservation.quantity,
    version,
  }
  return applied(nextState(state, nextInventory, updatedReservation), [{
    type: 'inventory_reserved',
    reservationId: reservation.id,
    quantity: reservation.quantity,
    expiresAt: command.expiresAt,
    inventoryVersion: version,
  }])
}

function applyCancel(
  state: InventoryState,
  command: Extract<InventoryCommand, { type: 'cancel_reservation' }>,
): InventoryCommandResult {
  if (!Number.isFinite(command.cancelledAt)) return reject(state, 'invalid_timestamp')
  if (command.expectedVersion !== state.inventory.version) {
    return reject(state, 'version_conflict')
  }
  const reservation = findReservation(state, command.reservationId)
  if (!reservation) return reject(state, 'reservation_not_found')
  if (reservation.status !== 'pending' && reservation.status !== 'reserved') {
    return reject(state, 'invalid_reservation_status')
  }

  const quantityReleased = reservation.status === 'reserved' ? reservation.quantity : 0
  const inventory = quantityReleased > 0
    ? {
        ...state.inventory,
        reservedQuantity: state.inventory.reservedQuantity - quantityReleased,
        version: state.inventory.version + 1,
      }
    : state.inventory
  const updatedReservation: Reservation = {
    ...reservation,
    status: 'cancelled',
    expiresAt: null,
    updatedAt: command.cancelledAt,
    inventoryVersion: inventory.version,
  }
  return applied(nextState(state, inventory, updatedReservation), [{
    type: 'reservation_cancelled',
    reservationId: reservation.id,
    quantityReleased,
    occurredAt: command.cancelledAt,
  }])
}

function applyExpire(
  state: InventoryState,
  command: Extract<InventoryCommand, { type: 'expire_reservation' }>,
): InventoryCommandResult {
  if (!Number.isFinite(command.checkedAt)) return reject(state, 'invalid_timestamp')
  if (command.expectedVersion !== state.inventory.version) {
    return reject(state, 'version_conflict')
  }
  const reservation = findReservation(state, command.reservationId)
  if (!reservation) return reject(state, 'reservation_not_found')
  if (reservation.status !== 'reserved') return reject(state, 'invalid_reservation_status')
  if (reservation.expiresAt === null || command.checkedAt < reservation.expiresAt) {
    return reject(state, 'reservation_not_expired')
  }

  const version = state.inventory.version + 1
  const inventory: Inventory = {
    ...state.inventory,
    reservedQuantity: state.inventory.reservedQuantity - reservation.quantity,
    version,
  }
  const updatedReservation: Reservation = {
    ...reservation,
    status: 'expired',
    updatedAt: command.checkedAt,
    inventoryVersion: version,
  }
  return applied(nextState(state, inventory, updatedReservation), [{
    type: 'reservation_expired',
    reservationId: reservation.id,
    quantityReleased: reservation.quantity,
    occurredAt: command.checkedAt,
  }])
}

function applyCheckout(
  state: InventoryState,
  command: Extract<InventoryCommand, { type: 'checkout' }>,
): InventoryCommandResult {
  if (!Number.isFinite(command.checkedOutAt)) return reject(state, 'invalid_timestamp')
  if (command.expectedVersion !== state.inventory.version) {
    return reject(state, 'version_conflict')
  }
  const reservation = findReservation(state, command.reservationId)
  if (!reservation) return reject(state, 'reservation_not_found')
  if (reservation.status !== 'reserved') return reject(state, 'invalid_reservation_status')
  if (reservation.expiresAt === null || command.checkedOutAt >= reservation.expiresAt) {
    return reject(state, 'reservation_expired')
  }

  const version = state.inventory.version + 1
  const approved = command.paymentStatus === 'approved'
  const inventory: Inventory = {
    ...state.inventory,
    reservedQuantity: state.inventory.reservedQuantity - reservation.quantity,
    soldQuantity: state.inventory.soldQuantity + (approved ? reservation.quantity : 0),
    version,
  }
  const updatedReservation: Reservation = {
    ...reservation,
    status: approved ? 'checked_out' : 'cancelled',
    expiresAt: null,
    updatedAt: command.checkedOutAt,
    inventoryVersion: version,
  }
  const next = nextState(state, inventory, updatedReservation)
  return approved
    ? applied(next, [{
        type: 'checkout_completed',
        reservationId: reservation.id,
        quantitySold: reservation.quantity,
        inventoryVersion: version,
        occurredAt: command.checkedOutAt,
      }])
    : applied(next, [{
        type: 'checkout_failed',
        reservationId: reservation.id,
        quantityReleased: reservation.quantity,
        reason: 'payment_declined',
        occurredAt: command.checkedOutAt,
      }])
}

/** Apply one inventory command without mutating its input state. */
export function transitionInventory(input: InventoryMachineInput): InventoryCommandResult {
  const { currentState, product, command } = input
  if (!isValidContext(currentState, product)) return reject(currentState, 'invalid_inventory')
  switch (command.type) {
    case 'request_reservation':
      if (command.productId !== product.id) return reject(currentState, 'product_mismatch')
      return applyRequest(currentState, command)
    case 'reserve_inventory':
      return applyReserve(currentState, product, command)
    case 'cancel_reservation':
      return applyCancel(currentState, command)
    case 'expire_reservation':
      return applyExpire(currentState, command)
    case 'checkout':
      return applyCheckout(currentState, command)
  }
}
