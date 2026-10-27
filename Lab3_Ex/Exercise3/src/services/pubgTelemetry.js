import { PUBG_VN_SQUADS } from '../data/pubg-vn-telemetry-spec.js'

const SIMULATED_DELAY_MS = 1200
const PACKET_LOSS_PROBABILITY = 0.35
const MAPS_WITH_PACKET_LOSS = ['Erangel', 'Miramar']

function createAbortError() {
  const error = new Error('Telemetry request was cancelled.')
  error.name = 'AbortError'
  return error
}

export function fetchPubgTelemetry(squadId, { signal }) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError())
      return
    }

    const squad = PUBG_VN_SQUADS.find((item) => item.id === squadId)
    if (!squad) {
      reject(new Error(`Unknown squad: ${squadId}`))
      return
    }

    let timeoutId
    let settled = false

    function cleanup() {
      clearTimeout(timeoutId)
      signal.removeEventListener('abort', handleAbort)
    }

    function finish(callback, value) {
      if (settled) return

      settled = true
      cleanup()
      callback(value)
    }

    function handleAbort() {
      finish(reject, createAbortError())
    }

    signal.addEventListener('abort', handleAbort, { once: true })
    timeoutId = setTimeout(() => {
      if (signal.aborted) {
        handleAbort()
        return
      }

      if (MAPS_WITH_PACKET_LOSS.includes(squad.map) && Math.random() < PACKET_LOSS_PROBABILITY) {
        finish(reject, new Error(`Telemetry packet loss on ${squad.map}.`))
        return
      }

      finish(resolve, { ...squad })
    }, SIMULATED_DELAY_MS)
  })
}
