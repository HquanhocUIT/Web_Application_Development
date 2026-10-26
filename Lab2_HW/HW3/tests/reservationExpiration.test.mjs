import assert from 'node:assert/strict'
import test from 'node:test'
import { expireDueReservations } from '../src/domain/reservationExpiration.ts'
import { transitionInventory } from '../src/domain/inventoryMachine.ts'

const product = {
  id: 'phone-1',
  name: 'Flash Sale Phone',
  priceVnd: 1000000,
  saleStartsAt: 1000,
  saleEndsAt: 10000,
}

function makeState(totalQuantity = 5) {
  return {
    inventory: {
      productId: product.id,
      totalQuantity,
      reservedQuantity: 0,
      soldQuantity: 0,
      version: 0,
    },
    reservations: [],
  }
}

function reserve(state, id, quantity = 1, expiresAt = 5000) {
  const requested = transitionInventory({
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
  assert.equal(requested.status, 'applied')

  const reserved = transitionInventory({
    product,
    currentState: requested.state,
    command: {
      type: 'reserve_inventory',
      reservationId: id,
      expectedVersion: requested.state.inventory.version,
      reservedAt: 1200,
      expiresAt,
    },
  })
  assert.equal(reserved.status, 'applied')
  return reserved.state
}

test('does not release a reservation before its expiry time', () => {
  const state = reserve(makeState(), 'not-yet-expired', 2)
  const result = expireDueReservations(state, product, 4999)

  assert.equal(result.status, 'processed')
  assert.strictEqual(result.state, state)
  assert.deepEqual(result.expiredReservationIds, [])
  assert.equal(result.state.inventory.reservedQuantity, 2)
})

test('expires at the deadline and releases held quantity', () => {
  const state = reserve(makeState(), 'due', 2)
  const result = expireDueReservations(state, product, 5000)

  assert.equal(result.status, 'processed')
  assert.deepEqual(result.expiredReservationIds, ['due'])
  assert.equal(result.state.reservations[0].status, 'expired')
  assert.equal(result.state.inventory.reservedQuantity, 0)
  assert.equal(result.state.inventory.version, state.inventory.version + 1)
  assert.equal(result.events[0].type, 'reservation_expired')
  assert.equal(result.events[0].quantityReleased, 2)
})

test('expires multiple due reservations while leaving future ones reserved', () => {
  const first = reserve(makeState(), 'due-1', 1, 4000)
  const second = reserve(first, 'due-2', 2, 5000)
  const third = reserve(second, 'future', 1, 6000)
  const result = expireDueReservations(third, product, 5000)

  assert.deepEqual(result.expiredReservationIds, ['due-1', 'due-2'])
  assert.deepEqual(result.state.reservations.map(({ status }) => status), [
    'expired',
    'expired',
    'reserved',
  ])
  assert.equal(result.state.inventory.reservedQuantity, 1)
  assert.equal(result.state.inventory.version, third.inventory.version + 2)
  assert.equal(result.failures.length, 0)
})

test('processing the same state again does not release a reservation twice', () => {
  const state = reserve(makeState(), 'due', 2)
  const first = expireDueReservations(state, product, 5000)
  assert.equal(first.status, 'processed')

  const second = expireDueReservations(first.state, product, 6000)
  assert.equal(second.status, 'processed')
  assert.strictEqual(second.state, first.state)
  assert.deepEqual(second.expiredReservationIds, [])
  assert.equal(second.state.inventory.reservedQuantity, 0)
  assert.equal(second.state.inventory.version, first.state.inventory.version)
})

test('an expired reservation cannot be checked out', () => {
  const state = reserve(makeState(), 'due')
  const expired = expireDueReservations(state, product, 5000)
  assert.equal(expired.status, 'processed')

  const checkout = transitionInventory({
    product,
    currentState: expired.state,
    command: {
      type: 'checkout',
      reservationId: 'due',
      expectedVersion: expired.state.inventory.version,
      checkedOutAt: 5001,
      paymentStatus: 'approved',
    },
  })

  assert.equal(checkout.status, 'rejected')
  assert.equal(checkout.reason, 'invalid_reservation_status')
  assert.strictEqual(checkout.state, expired.state)
})

test('invalid current time is rejected without changing state', () => {
  const state = reserve(makeState(), 'due')
  const result = expireDueReservations(state, product, Number.NaN)

  assert.equal(result.status, 'rejected')
  assert.equal(result.reason, 'invalid_timestamp')
  assert.strictEqual(result.state, state)
})

test('expiration processing does not mutate the input state', () => {
  const state = reserve(makeState(), 'due', 2)
  const original = structuredClone(state)

  expireDueReservations(state, product, 5000)

  assert.deepEqual(state, original)
})
