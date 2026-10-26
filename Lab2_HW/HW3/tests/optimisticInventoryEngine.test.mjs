import assert from 'node:assert/strict'
import test from 'node:test'
import { transitionInventory } from '../src/domain/inventoryMachine.ts'
import { OptimisticInventoryEngine } from '../src/domain/optimisticInventoryEngine.ts'

const product = {
  id: 'sale-item',
  name: 'Limited item',
  priceVnd: 100000,
  saleStartsAt: 0,
  saleEndsAt: 10000,
}

function makeEngine(totalQuantity, transition = transitionInventory) {
  return new OptimisticInventoryEngine(product, {
    inventory: {
      productId: product.id,
      totalQuantity,
      reservedQuantity: 0,
      soldQuantity: 0,
      version: 0,
    },
    reservations: [],
  }, transition)
}

function makeRequest(id, overrides = {}) {
  return {
    requestId: `request-${id}`,
    reservationId: `reservation-${id}`,
    productId: product.id,
    quantity: 1,
    expectedVersion: 0,
    requestedAt: 100,
    reservationExpiresAt: 5000,
    ...overrides,
  }
}

const retry3 = { maxAttempts: 3 }

test('only one request holding the last item succeeds when both read the same version', async () => {
  const engine = makeEngine(1)
  const [first, second] = await Promise.all([
    engine.reserve({ request: makeRequest('A'), retryPolicy: { maxAttempts: 1 } }),
    engine.reserve({ request: makeRequest('B'), retryPolicy: { maxAttempts: 1 } }),
  ])

  const results = [first, second]
  assert.equal(results.filter((result) => result.status === 'reserved').length, 1)
  const rejected = results.find((result) => result.status === 'rejected')
  assert.equal(rejected.reason, 'version_conflict')
  assert.equal(engine.getState().inventory.reservedQuantity, 1)
  assert.equal(engine.getState().inventory.version, 1)
})

test('many simultaneous requests never reserve more than the limited stock', async () => {
  const engine = makeEngine(3)
  const requests = Array.from({ length: 7 }, (_, index) =>
    engine.reserve({ request: makeRequest(String(index)), retryPolicy: { maxAttempts: 8 } }),
  )
  const results = await Promise.all(requests)
  const state = engine.getState()

  assert.equal(results.filter((result) => result.status === 'reserved').length, 3)
  assert.equal(state.inventory.reservedQuantity, 3)
  assert.equal(state.inventory.soldQuantity + state.inventory.reservedQuantity <= 3, true)
  assert.equal(state.reservations.filter((reservation) => reservation.status === 'reserved').length, 3)
  assert.equal(results.every((result) => result.status === 'reserved' || result.status === 'rejected'), true)
})

test('a version conflict leaves inventory and reservations unchanged', async () => {
  const engine = makeEngine(2)
  const before = engine.getState()
  const result = await engine.reserve({
    request: makeRequest('stale', { expectedVersion: 4 }),
    retryPolicy: { maxAttempts: 1 },
  })

  assert.equal(result.status, 'rejected')
  assert.equal(result.reason, 'version_conflict')
  assert.deepEqual(engine.getState(), before)
  assert.deepEqual(result.state, before)
})

test('a version conflict retries with the latest version when stock remains', async () => {
  const engine = makeEngine(2)
  const [first, second] = await Promise.all([
    engine.reserve({ request: makeRequest('first'), retryPolicy: retry3 }),
    engine.reserve({ request: makeRequest('second'), retryPolicy: retry3 }),
  ])

  assert.equal(first.status, 'reserved')
  assert.equal(second.status, 'reserved')
  assert.equal(second.attempts, 2)
  assert.equal(engine.getState().inventory.reservedQuantity, 2)
  assert.equal(engine.getState().inventory.version, 2)
  assert.equal(engine.getState().reservations.length, 2)
})

test('a retry is rejected as out of stock when another request took the last item', async () => {
  const engine = makeEngine(1)
  const [first, second] = await Promise.all([
    engine.reserve({ request: makeRequest('winner'), retryPolicy: retry3 }),
    engine.reserve({ request: makeRequest('loser'), retryPolicy: retry3 }),
  ])

  assert.equal(first.status, 'reserved')
  assert.equal(second.status, 'rejected')
  assert.equal(second.reason, 'insufficient_stock')
  assert.equal(second.attempts, 2)
  assert.equal(engine.getState().reservations.length, 1)
})

test('business failures are not retried', async () => {
  let transitionCalls = 0
  const businessFailure = (input) => {
    transitionCalls += 1
    return {
      status: 'rejected',
      state: input.currentState,
      reason: 'insufficient_stock',
      currentVersion: input.currentState.inventory.version,
    }
  }
  const engine = makeEngine(3, businessFailure)
  const result = await engine.reserve({ request: makeRequest('no-retry'), retryPolicy: retry3 })

  assert.equal(result.status, 'rejected')
  assert.equal(result.reason, 'insufficient_stock')
  assert.equal(result.attempts, 1)
  assert.equal(transitionCalls, 1)
  assert.equal(engine.getState().inventory.reservedQuantity, 0)
})

test('duplicate in-flight or completed request IDs do not create another reservation', async () => {
  const engine = makeEngine(2)
  const request = makeRequest('same')
  const [first, duplicate] = await Promise.all([
    engine.reserve({ request, retryPolicy: retry3 }),
    engine.reserve({ request, retryPolicy: retry3 }),
  ])

  assert.equal(first.status, 'reserved')
  assert.equal(duplicate.status, 'reserved')
  assert.equal(engine.getState().reservations.length, 1)
  assert.equal(engine.getState().inventory.version, 1)

  const replay = await engine.reserve({ request, retryPolicy: retry3 })
  assert.equal(replay.status, 'reserved')
  assert.equal(engine.getState().reservations.length, 1)
})

test('reusing a request ID with different data is rejected', async () => {
  const engine = makeEngine(2)
  const request = makeRequest('reused')
  await engine.reserve({ request, retryPolicy: retry3 })
  const changedRequest = makeRequest('reused', { quantity: 2 })
  const result = await engine.reserve({ request: changedRequest, retryPolicy: retry3 })

  assert.equal(result.status, 'rejected')
  assert.equal(result.reason, 'request_id_reused')
  assert.equal(engine.getState().reservations.length, 1)
})

test('retry attempts stop at the configured maximum', async () => {
  let transitionCalls = 0
  const alwaysConflicts = (input) => {
    transitionCalls += 1
    return {
      status: 'rejected',
      state: input.currentState,
      reason: 'version_conflict',
      currentVersion: input.currentState.inventory.version,
    }
  }
  const engine = makeEngine(5, alwaysConflicts)
  const result = await engine.reserve({
    request: makeRequest('limited'),
    retryPolicy: { maxAttempts: 3 },
  })

  assert.equal(result.status, 'rejected')
  assert.equal(result.reason, 'retry_limit_reached')
  assert.equal(result.attempts, 3)
  assert.equal(transitionCalls, 3)
  assert.equal(engine.getState().inventory.version, 0)
})

test('invalid quantity and product ID are rejected before any retry attempt', async () => {
  const engine = makeEngine(5)
  const invalidQuantity = await engine.reserve({
    request: makeRequest('bad-quantity', { quantity: 0 }),
    retryPolicy: retry3,
  })
  const invalidProduct = await engine.reserve({
    request: makeRequest('bad-product', { productId: 'other-product' }),
    retryPolicy: retry3,
  })

  assert.equal(invalidQuantity.reason, 'invalid_quantity')
  assert.equal(invalidQuantity.attempts, 0)
  assert.equal(invalidProduct.reason, 'product_mismatch')
  assert.equal(invalidProduct.attempts, 0)
  assert.equal(engine.getState().reservations.length, 0)
})
