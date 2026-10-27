import { useId, useState } from 'react'
import PubgMatchTelemetry from './components/PubgMatchTelemetry.jsx'
import { PUBG_VN_SQUADS } from './data/pubg-vn-telemetry-spec.js'

function App() {
  const [squadId, setSquadId] = useState('te')
  const squadSelectId = useId()

  return (
    <main className="page">
      <header className="pageHeader">
        <p className="eyebrow">PUBG VIETNAM SERIES</p>
        <h1>Live Match Telemetry</h1>
        <p className="pageIntro">Follow live match data for a PVS squad.</p>
      </header>

      <section className="squadPicker" aria-label="Choose a squad to track">
        <label htmlFor={squadSelectId}>Tracked squad</label>
        <select
          id={squadSelectId}
          value={squadId}
          onChange={(event) => setSquadId(event.target.value)}
        >
          {PUBG_VN_SQUADS.map((squad) => (
            <option key={squad.id} value={squad.id}>
              {squad.name}
            </option>
          ))}
        </select>
      </section>

      <PubgMatchTelemetry squadId={squadId} />
    </main>
  )
}

export default App
