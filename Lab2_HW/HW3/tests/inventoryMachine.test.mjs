import assert from 'node:assert/strict'
import test from 'node:test'
import { transitionInventory } from '../src/domain/inventoryMachine.ts'

const product = {
  id: 'phone-1',
  name: 'Flash Sale Phone',
  priceVnd: 1000000,
  saleStartsAt: 1000,
  saleEndsAt: 10000,
}

function makeState(overrides = {}) {
  return {
    inventory: {
      productId: product.id,
      totalQuantity: 5,
      reservedQuantity: 0,
      soldQuantity: 0,
      version: 0,
      ...overrides.inventory,
    },
    reservations: overrides.reservations ?? [],
  }
}

function request(state, id = 'reservation-1', quantity = 1) {
  return transitionInventory({
    product,
    currentState: state,
    command: {
      type: 'request_reservation',
      productId: product.id,
      reservationId: id,
      quantity,
      requestedAt: 1100,
    },
  })
}

function reserve(state, id = 'reservation-1') {
  return transitionInventory({
    product,
    currentState: state,
    command: {
      type: 'reserve_inventory',
      reservationId: id,
      expectedVersion: state.inventory.version,
      reservedAt: 1200,
      expiresAt: 5000,
    },
  })
}

function makeReservedState(quantity = 1, overrides = {}) {
  const initial = makeState(overrides)
  const pending = request(initial, 'reservation-1', quantity)
  assert.equal(pending.status, 'applied')
  const held = reserve(pending.state)
  assert.equal(held.status, 'applied')
  return held.state
}

function runWithState(state, command) {
  return transitionInventory({ product, currentState: state, command })
}

test('reserves inventory when quantity is available', () => {
  const pending = request(makeState(), 'reservation-1', 2)
  assert.equal(pending.status, 'applied')
  const result = reserve(pending.state)

  assert.equal(result.status, 'applied')
  assert.equal(result.state.inventory.reservedQuantity, 2)
  assert.equal(result.state.inventory.version, 1)
  assert.equal(result.state.reservations[0].status, 'reserved')
})

test('rejects a reservation when stock is insufficient without changing state', () => {
  const initial = makeState({ inventory: { totalQuantity: 1, soldQuantity: 1 } })
  const pending = request(initial)
  const result = reserve(pending.state)

  assert.equal(result.status, 'rejected')
  assert.equal(result.reason, 'insufficient_stock')
  assert.strictEqual(result.state, pending.state)
})

test('checks out a reserved quantity and moves it to sold stock', () => {
  const state = makeReservedState(2)
  const result = runWithState(state, {
    type: 'checkout',
    reservationId: 'reservation-1',
    expectedVersion: state.inventory.version,
    checkedOutAt: 1300,
    paymentStatus: 'approved',
  })

  assert.equal(result.status, 'applied')
  assert.equal(result.state.inventory.reservedQuantity, 0)
  assert.equal(result.state.inventory.soldQuantity, 2)
  assert.equal(result.state.reservations[0].status, 'checked_out')
})

test('cancels a reserved item and releases its stock', () => {
  const state = makeReservedState(2)
  const result = runWithState(state, {
    type: 'cancel_reservation',
    reservationId: 'reservation-1',
    expectedVersion: state.inventory.version,
    cancelledAt: 1400,
  })

  assert.equal(result.status, 'applied')
  assert.equal(result.state.inventory.reservedQuantity, 0)
  assert.equal(result.state.reservations[0].status, 'cancelled')
})

test('expires a reservation at its deadline and releases its stock', () => {
  const state = makeReservedState(2)
  const result = runWithState(state, {
    type: 'expire_reservation',
    reservationId: 'reservation-1',
    expectedVersion: state.inventory.version,
    checkedAt: 5000,
  })

  assert.equal(result.status, 'applied')
  assert.equal(result.state.inventory.reservedQuantity, 0)
  assert.equal(result.state.reservations[0].status, 'expired')
})

test('rejects a second checkout of an already checked-out reservation', () => {
  const state = makeReservedState()
  const checkedOut = runWithState(state, {
    type: 'checkout',
    reservationId: 'reservation-1',
    expectedVersion: state.inventory.version,
    checkedOutAt: 1300,
    paymentStatus: 'approved',
  })
  assert.equal(checkedOut.status, 'applied')

  const duplicate = runWithState(checkedOut.state, {
    type: 'checkout',
    reservationId: 'reservation-1',
    expectedVersion: checkedOut.state.inventory.version,
    checkedOutAt: 1400,
    paymentStatus: 'approved',
  })
  assert.equal(duplicate.status, 'rejected')
  assert.equal(duplicate.reason, 'invalid_reservation_status')
  assert.strictEqual(duplicate.state, checkedOut.state)
})

test('rejects a second cancellation without releasing stock a second time', () => {
  const state = makeReservedState(2)
  const cancelled = runWithState(state, {
    type: 'cancel_reservation',
    reservationId: 'reservation-1',
    expectedVersion: state.inventory.version,
    cancelledAt: 1300,
  })
  assert.equal(cancelled.status, 'applied')
  const versionAfterFirstCancel = cancelled.state.inventory.version

  const duplicate = runWithState(cancelled.state, {
    type: 'cancel_reservation',
    reservationId: 'reservation-1',
    expectedVersion: cancelled.state.inventory.version,
    cancelledAt: 1400,
  })
  assert.equal(duplicate.status, 'rejected')
  assert.equal(duplicate.state.inventory.reservedQuantity, 0)
  assert.equal(duplicate.state.inventory.version, versionAfterFirstCancel)
})

test('declined payment cancels the reservation and releases its quantity', () => {
  const state = makeReservedState(2)
  const result = runWithState(state, {
    type: 'checkout',
    reservationId: 'reservation-1',
    expectedVersion: state.inventory.version,
    checkedOutAt: 1300,
    paymentStatus: 'declined',
  })

  assert.equal(result.status, 'applied')
  assert.equal(result.state.inventory.reservedQuantity, 0)
  assert.equal(result.state.inventory.soldQuantity, 0)
  assert.equal(result.state.reservations[0].status, 'cancelled')
  assert.equal(result.events[0].type, 'checkout_failed')
})

test('rejects invalid quantity without changing state', () => {
  const initial = makeState()
  const result = request(initial, 'bad-reservation', 0)

  assert.equal(result.status, 'rejected')
  assert.equal(result.reason, 'invalid_quantity')
  assert.strictEqual(result.state, initial)
})

test('rejects an expired reservation checkout without changing state', () => {
  const state = makeReservedState()
  const result = runWithState(state, {
    type: 'checkout',
    reservationId: 'reservation-1',
    expectedVersion: state.inventory.version,
    checkedOutAt: 5000,
    paymentStatus: 'approved',
  })

  assert.equal(result.status, 'rejected')
  assert.equal(result.reason, 'reservation_expired')
  assert.strictEqual(result.state, state)
})

test('rejects a stale inventory version without changing state', () => {
  const state = makeReservedState()
  const result = runWithState(state, {
    type: 'cancel_reservation',
    reservationId: 'reservation-1',
    expectedVersion: state.inventory.version - 1,
    cancelledAt: 1300,
  })

  assert.equal(result.status, 'rejected')
  assert.equal(result.reason, 'version_conflict')
  assert.strictEqual(result.state, state)
})
