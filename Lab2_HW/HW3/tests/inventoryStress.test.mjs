import assert from 'node:assert/strict'
import test from 'node:test'
import { OptimisticInventoryEngine } from '../src/domain/optimisticInventoryEngine.ts'

const product = {
  id: 'stress-product',
  name: 'Stress Test Product',
  priceVnd: 100000,
  saleStartsAt: 0,
  saleEndsAt: 100000,
}

function createEngine(totalQuantity) {
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

function assertInvariant(state) {
  assert.ok(state.inventory.totalQuantity >= 0)
  assert.ok(state.inventory.reservedQuantity >= 0)
  assert.ok(state.inventory.soldQuantity >= 0)
  assert.ok(
    state.inventory.soldQuantity + state.inventory.reservedQuantity <=
      state.inventory.totalQuantity,
  )
  assert.equal(
    state.reservations
      .filter((reservation) => reservation.status === 'reserved')
      .reduce((quantity, reservation) => quantity + reservation.quantity, 0),
    state.inventory.reservedQuantity,
  )
}

for (const requestCount of [10, 100, 1000]) {
  test(`${requestCount} simultaneous requests cannot oversell limited stock`, async () => {
    const stock = 3
    const engine = createEngine(stock)
    const initialVersion = engine.getState().inventory.version
    const requests = Array.from({ length: requestCount }, (_, index) => {
      const id = String(index)
      return engine.reserve({
        request: {
          requestId: `stress-request-${id}`,
          reservationId: `stress-reservation-${id}`,
          productId: product.id,
          quantity: 1,
          expectedVersion: initialVersion,
          requestedAt: 1000,
          reservationExpiresAt: 30000,
        },
        retryPolicy: { maxAttempts: 4 },
      })
    })

    const results = await Promise.all(requests)
    const state = engine.getState()
    const successful = results.filter((result) => result.status === 'reserved')
    const successfulReservationIds = successful.map((result) => result.reservation.id)

    assert.equal(results.length, requestCount)
    assert.equal(successful.length, stock)
    assert.equal(new Set(successfulReservationIds).size, successful.length)
    assert.equal(state.inventory.reservedQuantity, successful.length)
    assert.equal(state.inventory.soldQuantity, 0)
    assert.equal(state.inventory.version, successful.length)
    assert.ok(results.every((result) => result.status === 'reserved' || result.status === 'rejected'))
    assert.ok(results.every((result) => result.status !== 'rejected' || result.attempts <= 4))
    assertInvariant(state)
  })
}
