import assert from 'node:assert/strict'
import test from 'node:test'
import { OptimisticInventoryEngine } from '../src/domain/optimisticInventoryEngine.ts'

const product = {
  id: 'sale-item',
  name: 'Limited item',
  priceVnd: 100000,
  saleStartsAt: 0,
  saleEndsAt: 10000,
}

function makeEngine(totalQuantity = 5) {
  return new OptimisticInventoryEngine(product, {
    inventory: {
      productId: product.id,
      totalQuantity,
      reservedQuantity: 0,
      soldQuantity: 0,
      version: 0,
    },
    reservations: [],
  })
}

async function reserve(engine, id, quantity = 1, expiresAt = 5000) {
  return engine.reserve({
    request: {
      requestId: `request-${id}`,
      reservationId: id,
      productId: product.id,
      quantity,
      expectedVersion: engine.getState().inventory.version,
      requestedAt: 100,
      reservationExpiresAt: expiresAt,
    },
    retryPolicy: { maxAttempts: 2 },
  })
}

function command(engine, id, paymentStatus, checkedOutAt = 2000, expectedVersion) {
  return {
    type: 'checkout',
    reservationId: id,
    expectedVersion: expectedVersion ?? engine.getState().inventory.version,
    checkedOutAt,
    paymentStatus,
  }
}

function assertInventoryInvariants(state) {
  assert.equal(state.inventory.soldQuantity >= 0, true)
  assert.equal(state.inventory.reservedQuantity >= 0, true)
  assert.equal(
    state.inventory.soldQuantity + state.inventory.reservedQuantity <= state.inventory.totalQuantity,
    true,
  )
}

test('successful checkout moves held quantity to sold and advances version', async () => {
  const engine = makeEngine(3)
  await reserve(engine, 'checkout-ok', 2)
  const before = engine.getState()
  const result = engine.checkout(command(engine, 'checkout-ok', 'approved'))

  assert.equal(result.status, 'completed')
  assert.equal(result.state.reservations[0].status, 'checked_out')
  assert.equal(result.state.inventory.reservedQuantity, 0)
  assert.equal(result.state.inventory.soldQuantity, 2)
  assert.equal(result.state.inventory.version, before.inventory.version + 1)
  assert.equal(result.events.at(-1).type, 'checkout_completed')
  assertInventoryInvariants(engine.getState())
})

test('declined payment cancels reservation and releases held stock once', async () => {
  const engine = makeEngine(3)
  await reserve(engine, 'declined', 2)
  const result = engine.checkout(command(engine, 'declined', 'declined'))

  assert.equal(result.status, 'payment_declined')
  assert.equal(result.state.reservations[0].status, 'cancelled')
  assert.equal(result.state.inventory.reservedQuantity, 0)
  assert.equal(result.state.inventory.soldQuantity, 0)
  assert.equal(result.events.at(-1).type, 'checkout_failed')
  assert.equal(result.events.at(-1).quantityReleased, 2)
  assertInventoryInvariants(engine.getState())
})

test('a repeated checkout is rejected without changing inventory a second time', async () => {
  const engine = makeEngine(2)
  await reserve(engine, 'duplicate')
  const first = engine.checkout(command(engine, 'duplicate', 'approved'))
  const afterFirst = engine.getState()
  const duplicate = engine.checkout(command(engine, 'duplicate', 'approved'))

  assert.equal(first.status, 'completed')
  assert.equal(duplicate.status, 'rejected')
  assert.equal(duplicate.reason, 'invalid_reservation_status')
  assert.deepEqual(engine.getState(), afterFirst)
  assertInventoryInvariants(engine.getState())
})

test('an already expired reservation cannot checkout', async () => {
  const engine = makeEngine(2)
  await reserve(engine, 'expired')
  const result = engine.checkout(command(engine, 'expired', 'approved', 5000))

  assert.equal(result.status, 'rejected')
  assert.equal(result.reason, 'reservation_expired')
  assert.equal(result.state.reservations[0].status, 'expired')
  assert.equal(result.state.inventory.reservedQuantity, 0)
  assert.equal(result.events.at(-1).type, 'reservation_expired')
  assertInventoryInvariants(engine.getState())
})

test('a stale inventory version is rejected without changing state', async () => {
  const engine = makeEngine(2)
  await reserve(engine, 'stale')
  const before = engine.getState()
  const result = engine.checkout(command(
    engine,
    'stale',
    'approved',
    2000,
    before.inventory.version - 1,
  ))

  assert.equal(result.status, 'rejected')
  assert.equal(result.reason, 'version_conflict')
  assert.deepEqual(engine.getState(), before)
  assert.deepEqual(result.state, before)
})

test('checkout processes other due reservations before applying a valid checkout', async () => {
  const engine = makeEngine(4)
  await reserve(engine, 'expired-first', 1, 1800)
  await reserve(engine, 'active-second', 2, 5000)
  const result = engine.checkout(command(engine, 'active-second', 'approved', 2000))

  assert.equal(result.status, 'completed')
  assert.deepEqual(result.state.reservations.map(({ status }) => status), [
    'expired',
    'checked_out',
  ])
  assert.deepEqual(result.events.map(({ type }) => type), [
    'reservation_expired',
    'checkout_completed',
  ])
  assert.equal(result.state.inventory.reservedQuantity, 0)
  assert.equal(result.state.inventory.soldQuantity, 2)
  assertInventoryInvariants(engine.getState())
})

test('a cancelled reservation cannot be charged again', async () => {
  const engine = makeEngine(2)
  await reserve(engine, 'cancelled')
  engine.checkout(command(engine, 'cancelled', 'declined'))
  const afterDecline = engine.getState()
  const duplicateCharge = engine.checkout(command(engine, 'cancelled', 'approved'))

  assert.equal(duplicateCharge.status, 'rejected')
  assert.equal(duplicateCharge.reason, 'invalid_reservation_status')
  assert.deepEqual(engine.getState(), afterDecline)
  assertInventoryInvariants(engine.getState())
})
