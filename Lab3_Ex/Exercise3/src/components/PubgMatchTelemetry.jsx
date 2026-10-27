import { useEffect, useState } from 'react'
import { fetchPubgTelemetry } from '../services/pubgTelemetry.js'

function PubgMatchTelemetry({ squadId = 'te' } = {}) {
  const [view, setView] = useState({ status: 'IDLE', data: null, error: null })
  const viewMatchesSquad =
    view.status === 'IDLE' ||
    view.status === 'LOADING' ||
    (view.status === 'SUCCESS' && view.data?.id === squadId) ||
    (view.status === 'ERROR' && view.error?.squadId === squadId)
  const visibleStatus = viewMatchesSquad ? view.status : 'LOADING'

  useEffect(() => {
    const controller = new AbortController()
    let isCurrentRequest = true

    Promise.resolve().then(() => {
      if (!isCurrentRequest || controller.signal.aborted) return

      setView({ status: 'LOADING', data: null, error: null })
    })

    fetchPubgTelemetry(squadId, { signal: controller.signal })
      .then((data) => {
        if (!isCurrentRequest || controller.signal.aborted) return

        setView({ status: 'SUCCESS', data, error: null })
      })
      .catch((error) => {
        if (error.name === 'AbortError' || !isCurrentRequest || controller.signal.aborted) return

        setView({ status: 'ERROR', data: null, error: { squadId, message: error.message } })
      })

    return () => {
      isCurrentRequest = false
      controller.abort()
    }
  }, [squadId])

  return (
    <section className="telemetryPanel" aria-labelledby="telemetry-heading">
      <h2 id="telemetry-heading">Match telemetry</h2>
      {visibleStatus === 'IDLE' && (
        <p className="telemetryState" role="status">IDLE: telemetry request has not started.</p>
      )}
      {visibleStatus === 'LOADING' && (
        <p className="telemetryState" role="status">LOADING: receiving squad telemetry…</p>
      )}
      {visibleStatus === 'SUCCESS' && (
        <article className="telemetryData" aria-label={`${view.data.name} telemetry`}>
          <h3>{view.data.name}</h3>
          <dl>
            <div><dt>Map</dt><dd>{view.data.map}</dd></div>
            <div><dt>Phase</dt><dd>{view.data.phase}</dd></div>
            <div><dt>Alive</dt><dd>{view.data.alive}</dd></div>
            <div><dt>Kills</dt><dd>{view.data.kills}</dd></div>
            <div><dt>WWCD probability</dt><dd>{view.data.wwcdProb}%</dd></div>
            <div><dt>Status</dt><dd>{view.data.status}</dd></div>
          </dl>
        </article>
      )}
      {visibleStatus === 'ERROR' && (
        <p className="telemetryError">ERROR: {view.error.message}</p>
      )}
    </section>
  )
}

export default PubgMatchTelemetry
