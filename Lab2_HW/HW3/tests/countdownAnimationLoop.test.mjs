import assert from 'node:assert/strict'
import test from 'node:test'
import { startCountdownAnimationLoop } from '../src/domain/countdownAnimationLoop.ts'

function createScheduler() {
  let nextId = 1
  let nowMs = 1000
  const pending = new Map()
  const cancelled = []
  const delivered = []

  return {
    pending,
    cancelled,
    delivered,
    scheduler: {
      now: () => nowMs,
      request(callback) {
        const id = nextId++
        pending.set(id, callback)
        return id
      },
      cancel(id) {
        cancelled.push(id)
        pending.delete(id)
      },
    },
    setNow(value) {
      nowMs = value
    },
    runFrame() {
      const frame = pending.entries().next().value
      if (!frame) return
      const [id, callback] = frame
      pending.delete(id)
      delivered.push(callback)
      callback(16)
    },
  }
}

test('keeps only one scheduled frame and reads the current time each frame', () => {
  const mock = createScheduler()
  const observedTimes = []
  const stop = startCountdownAnimationLoop((nowMs) => {
    observedTimes.push(nowMs)
    return true
  }, mock.scheduler)

  assert.deepEqual(observedTimes, [1000])
  assert.equal(mock.pending.size, 1)
  mock.setNow(2750)
  mock.runFrame()
  assert.deepEqual(observedTimes, [1000, 2750])
  assert.equal(mock.pending.size, 1)

  stop()
  assert.equal(mock.pending.size, 0)
})

test('cleanup cancels the pending frame and a stale callback cannot restart the loop', () => {
  const mock = createScheduler()
  const stop = startCountdownAnimationLoop(() => true, mock.scheduler)
  const scheduledId = mock.pending.keys().next().value
  const staleCallback = mock.pending.get(scheduledId)

  stop()
  assert.deepEqual(mock.cancelled, [scheduledId])
  staleCallback(16)
  assert.equal(mock.pending.size, 0)
})

test('the loop stops scheduling when the callback reports a terminal state', () => {
  const mock = createScheduler()
  let calls = 0
  startCountdownAnimationLoop(() => {
    calls += 1
    return false
  }, mock.scheduler)

  assert.equal(calls, 1)
  assert.equal(mock.pending.size, 0)
})

test('StrictMode-style setup, cleanup, and setup leaves only one active loop', () => {
  const mock = createScheduler()
  const stopFirst = startCountdownAnimationLoop(() => true, mock.scheduler)
  const staleCallback = mock.pending.values().next().value
  stopFirst()

  const stopSecond = startCountdownAnimationLoop(() => true, mock.scheduler)
  assert.equal(mock.pending.size, 1)
  staleCallback(16)
  assert.equal(mock.pending.size, 1)

  stopSecond()
  assert.equal(mock.pending.size, 0)
})
