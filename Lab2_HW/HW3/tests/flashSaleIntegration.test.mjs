import assert from 'node:assert/strict'
import test from 'node:test'
import { createFlashSaleEngines, getAvailableQuantity } from '../src/domain/flashSaleSession.ts'

const saleStartsAt = 1000
const saleEndsAt = 100000
const products = [
  { id: 'one', name: 'Product One', priceVnd: 100000, totalQuantity: 2, soldQuantity: 0 },
  { id: 'two', name: 'Product Two', priceVnd: 200000, totalQuantity: 1, soldQuantity: 0 },
]

function createSession() {
  return createFlashSaleEngines(products, saleStartsAt, saleEndsAt)
}

async function reserve(engine, productId, reservationId, overrides = {}) {
  const nowMs = overrides.requestedAt ?? 2000
  return engine.reserve({
    request: {
      requestId: `request-${reservationId}`,
      reservationId,
      productId,
      quantity: overrides.quantity ?? 1,
      expectedVersion: overrides.expectedVersion ?? engine.getState().inventory.version,
      requestedAt: nowMs,
      reservationExpiresAt: overrides.expiresAt ?? 50000,
    },
    retryPolicy: { maxAttempts: 3 },
  })
}

function checkout(engine, reservationId, checkedOutAt = 3000, paymentStatus = 'approved') {
  return engine.checkout({
    type: 'checkout',
    reservationId,
    expectedVersion: engine.getState().inventory.version,
    checkedOutAt,
    paymentStatus,
  })
}

function assertInventoryInvariant(state) {
  assert.ok(state.inventory.soldQuantity >= 0)
  assert.ok(state.inventory.reservedQuantity >= 0)
  assert.ok(
    state.inventory.soldQuantity + state.inventory.reservedQuantity <=
      state.inventory.totalQuantity,
  )
}

test('product engines keep their own product ID and independent inventory', async () => {
  const engines = createSession()
  const first = engines.get('one')
  const second = engines.get('two')
  assert.ok(first)
  assert.ok(second)

  const result = await reserve(first, 'one', 'one-hold')
  assert.equal(result.status, 'reserved')
  assert.equal(first.getState().inventory.productId, 'one')
  assert.equal(second.getState().inventory.productId, 'two')
  assert.equal(getAvailableQuantity(first.getState()), 1)
  assert.equal(getAvailableQuantity(second.getState()), 1)
  assert.equal(second.getState().inventory.version, 0)
})

test('checkout updates the product inventory and a duplicate checkout changes nothing', async () => {
  const engine = createSession().get('one')
  const held = await reserve(engine, 'one', 'checkout-hold')
  assert.equal(held.status, 'reserved')
  assert.equal(getAvailableQuantity(engine.getState()), 1)

  const paid = checkout(engine, 'checkout-hold')
  assert.equal(paid.status, 'completed')
  assert.equal(engine.getState().inventory.soldQuantity, 1)
  assert.equal(getAvailableQuantity(engine.getState()), 1)
  assertInventoryInvariant(engine.getState())

  const afterCheckout = engine.getState()
  const duplicate = engine.checkout({
    type: 'checkout',
    reservationId: 'checkout-hold',
    expectedVersion: afterCheckout.inventory.version,
    checkedOutAt: 4000,
    paymentStatus: 'approved',
  })
  assert.equal(duplicate.status, 'rejected')
  assert.deepEqual(engine.getState(), afterCheckout)
})

test('cancel returns held quantity exactly once', async () => {
  const engine = createSession().get('one')
  await reserve(engine, 'one', 'cancel-hold')
  assert.equal(getAvailableQuantity(engine.getState()), 1)

  const cancelled = engine.cancelReservation({
    type: 'cancel_reservation',
    reservationId: 'cancel-hold',
    expectedVersion: engine.getState().inventory.version,
    cancelledAt: 3000,
  })
  assert.equal(cancelled.status, 'applied')
  assert.equal(getAvailableQuantity(engine.getState()), 2)
  const versionAfterCancel = engine.getState().inventory.version

  const duplicate = engine.cancelReservation({
    type: 'cancel_reservation',
    reservationId: 'cancel-hold',
    expectedVersion: versionAfterCancel,
    cancelledAt: 4000,
  })
  assert.equal(duplicate.status, 'rejected')
  assert.equal(engine.getState().inventory.version, versionAfterCancel)
  assert.equal(getAvailableQuantity(engine.getState()), 2)
  assertInventoryInvariant(engine.getState())
})

test('expiration scan in the engine releases due holds once using the supplied timestamp', async () => {
  const engine = createSession().get('one')
  await reserve(engine, 'one', 'expires', { expiresAt: 3500 })
  const expired = engine.expireReservations(3500)

  assert.equal(expired.status, 'processed')
  assert.deepEqual(expired.expiredReservationIds, ['expires'])
  assert.equal(getAvailableQuantity(engine.getState()), 2)
  assert.equal(engine.getState().reservations[0].status, 'expired')
  assertInventoryInvariant(engine.getState())

  const repeated = engine.expireReservations(5000)
  assert.deepEqual(repeated.expiredReservationIds, [])
  assert.equal(engine.getState().inventory.version, expired.state.inventory.version)
})

test('reports version conflicts and rejects purchase after sale end', async () => {
  const engine = createSession().get('one')
  await reserve(engine, 'one', 'conflict-hold')
  const current = engine.getState()
  const stale = engine.checkout({
    type: 'checkout',
    reservationId: 'conflict-hold',
    expectedVersion: current.inventory.version - 1,
    checkedOutAt: 3000,
    paymentStatus: 'approved',
  })
  assert.equal(stale.status, 'rejected')
  assert.equal(stale.reason, 'version_conflict')
  assertInventoryInvariant(engine.getState())

  const endedSaleRequest = await reserve(engine, 'one', 'after-sale', {
    requestedAt: saleEndsAt,
    expiresAt: saleEndsAt + 1000,
  })
  assert.equal(endedSaleRequest.status, 'rejected')
  assert.equal(endedSaleRequest.reason, 'sale_not_active')
  assertInventoryInvariant(engine.getState())
})

test('a held last unit cannot be sold through an additional reservation', async () => {
  const engine = createSession().get('two')
  const winner = await reserve(engine, 'two', 'last-unit')
  assert.equal(winner.status, 'reserved')
  assert.equal(getAvailableQuantity(engine.getState()), 0)

  const loser = await reserve(engine, 'two', 'sold-out')
  assert.equal(loser.status, 'rejected')
  assert.equal(loser.reason, 'insufficient_stock')
  assert.equal(getAvailableQuantity(engine.getState()), 0)
  assertInventoryInvariant(engine.getState())
})

test('two requests with the same expected version cannot hold the last unit twice', async () => {
  const engine = createSession().get('two')
  const sharedVersion = engine.getState().inventory.version
  const [first, second] = await Promise.all([
    reserve(engine, 'two', 'same-version-a', { expectedVersion: sharedVersion }),
    reserve(engine, 'two', 'same-version-b', { expectedVersion: sharedVersion }),
  ])

  assert.equal([first, second].filter((result) => result.status === 'reserved').length, 1)
  assert.equal(engine.getState().inventory.reservedQuantity, 1)
  assert.equal(getAvailableQuantity(engine.getState()), 0)
  assertInventoryInvariant(engine.getState())
})

test('a concurrent purchase retries after cancellation releases a reservation', async () => {
  const engine = createSession().get('two')
  await reserve(engine, 'two', 'cancel-race-original')
  const initialVersion = engine.getState().inventory.version
  const purchase = engine.reserve({
    request: {
      requestId: 'cancel-race-purchase-request',
      reservationId: 'cancel-race-purchase',
      productId: 'two',
      quantity: 1,
      expectedVersion: initialVersion,
      requestedAt: 2500,
      reservationExpiresAt: 50000,
    },
    retryPolicy: { maxAttempts: 3 },
  })
  const cancelled = engine.cancelReservation({
    type: 'cancel_reservation',
    reservationId: 'cancel-race-original',
    expectedVersion: initialVersion,
    cancelledAt: 2500,
  })
  const purchaseResult = await purchase

  assert.equal(cancelled.status, 'applied')
  assert.equal(purchaseResult.status, 'reserved')
  assert.equal(purchaseResult.attempts, 2)
  assert.equal(engine.getState().inventory.reservedQuantity, 1)
  assert.equal(getAvailableQuantity(engine.getState()), 0)
  assertInventoryInvariant(engine.getState())
})

test('a concurrent purchase retries after expiration releases a reservation', async () => {
  const engine = createSession().get('two')
  await reserve(engine, 'two', 'expiration-race-original', { expiresAt: 3500 })
  const initialVersion = engine.getState().inventory.version
  const purchase = engine.reserve({
    request: {
      requestId: 'expiration-race-purchase-request',
      reservationId: 'expiration-race-purchase',
      productId: 'two',
      quantity: 1,
      expectedVersion: initialVersion,
      requestedAt: 3500,
      reservationExpiresAt: 50000,
    },
    retryPolicy: { maxAttempts: 3 },
  })
  const expiration = engine.expireReservations(3500)
  const purchaseResult = await purchase

  assert.deepEqual(expiration.expiredReservationIds, ['expiration-race-original'])
  assert.equal(purchaseResult.status, 'reserved')
  assert.equal(purchaseResult.attempts, 2)
  assert.equal(engine.getState().reservations.find((item) =>
    item.id === 'expiration-race-original').status, 'expired')
  assert.equal(engine.getState().inventory.reservedQuantity, 1)
  assert.equal(getAvailableQuantity(engine.getState()), 0)
  assertInventoryInvariant(engine.getState())
})

test('payment failure releases a reservation and a repeated checkout changes nothing', async () => {
  const engine = createSession().get('one')
  await reserve(engine, 'one', 'payment-failure-hold')
  const declined = engine.checkout({
    type: 'checkout',
    reservationId: 'payment-failure-hold',
    expectedVersion: engine.getState().inventory.version,
    checkedOutAt: 3000,
    paymentStatus: 'declined',
  })

  assert.equal(declined.status, 'payment_declined')
  assert.equal(engine.getState().inventory.reservedQuantity, 0)
  assert.equal(engine.getState().inventory.soldQuantity, 0)
  assert.equal(getAvailableQuantity(engine.getState()), 2)
  const afterDecline = engine.getState()
  const repeated = engine.checkout({
    type: 'checkout',
    reservationId: 'payment-failure-hold',
    expectedVersion: afterDecline.inventory.version,
    checkedOutAt: 4000,
    paymentStatus: 'approved',
  })

  assert.equal(repeated.status, 'rejected')
  assert.deepEqual(engine.getState(), afterDecline)
  assertInventoryInvariant(engine.getState())
})
