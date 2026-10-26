import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateFlashSaleCountdown,
  isSameCountdownDisplay,
} from '../src/domain/flashSaleCountdown.ts'

test('calculates remaining end time and day/hour/minute/second parts', () => {
  const result = calculateFlashSaleCountdown(0, 90_061_000, 0)

  assert.equal(result.phase, 'active')
  assert.equal(result.remainingUntilEndMs, 90_061_000)
  assert.deepEqual(result.displayTime, {
    days: 1,
    hours: 1,
    minutes: 1,
    seconds: 1,
  })
})

test('shows a countdown to the start before the sale opens', () => {
  const result = calculateFlashSaleCountdown(3500, 10_000, 1000)

  assert.equal(result.phase, 'upcoming')
  assert.equal(result.remainingUntilStartMs, 2500)
  assert.equal(result.remainingUntilEndMs, 9000)
  assert.deepEqual(result.displayTime, {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 2,
  })
})

test('treats the exact start timestamp as active', () => {
  const result = calculateFlashSaleCountdown(1000, 5000, 1000)

  assert.equal(result.phase, 'active')
  assert.equal(result.remainingUntilStartMs, null)
  assert.equal(result.remainingUntilEndMs, 4000)
})

test('treats the exact end timestamp as ended and clamps remaining time to zero', () => {
  const result = calculateFlashSaleCountdown(1000, 5000, 5000)

  assert.equal(result.phase, 'ended')
  assert.equal(result.remainingUntilEndMs, 0)
  assert.deepEqual(result.displayTime, { days: 0, hours: 0, minutes: 0, seconds: 0 })
})

test('returns zero after the end time has passed', () => {
  const result = calculateFlashSaleCountdown(1000, 5000, 9000)

  assert.equal(result.phase, 'ended')
  assert.equal(result.remainingUntilEndMs, 0)
})

test('recalculates directly when the system clock moves backward', () => {
  const firstRead = calculateFlashSaleCountdown(0, 4000, 3000)
  const secondRead = calculateFlashSaleCountdown(0, 4000, 2500)

  assert.equal(firstRead.remainingUntilEndMs, 1000)
  assert.equal(secondRead.remainingUntilEndMs, 1500)
})

test('catches up from the current timestamp after a suspended tab resumes', () => {
  const beforePause = calculateFlashSaleCountdown(0, 5000, 1000)
  const afterResume = calculateFlashSaleCountdown(0, 5000, 6000)

  assert.equal(beforePause.remainingUntilEndMs, 4000)
  assert.equal(afterResume.phase, 'ended')
  assert.equal(afterResume.remainingUntilEndMs, 0)
})

test('returns an invalid zero snapshot for invalid time inputs', () => {
  const result = calculateFlashSaleCountdown(5000, 1000, Number.NaN)

  assert.equal(result.phase, 'invalid')
  assert.equal(result.remainingUntilEndMs, 0)
  assert.deepEqual(result.displayTime, { days: 0, hours: 0, minutes: 0, seconds: 0 })
})

test('display equality ignores sub-second changes but notices phase changes', () => {
  const firstFrame = calculateFlashSaleCountdown(0, 2500, 1000)
  const nextFrameSameSecond = calculateFlashSaleCountdown(0, 2500, 1500)
  const nextDisplayedSecond = calculateFlashSaleCountdown(0, 2500, 2000)

  assert.equal(isSameCountdownDisplay(firstFrame, nextFrameSameSecond), true)
  assert.equal(isSameCountdownDisplay(firstFrame, nextDisplayedSecond), false)
})
