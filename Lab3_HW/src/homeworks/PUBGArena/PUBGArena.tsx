import { Link } from 'react-router-dom'
import AirdropCountdownPanel from './components/AirdropCountdownPanel'
import ChampionshipHeader from './components/ChampionshipHeader'
import LeaderboardPanel from './components/LeaderboardPanel'
import RewardGrid from './components/RewardGrid'
import { mockCrateDrops, mockPubgPhase, mockPubgTickets, mockSquadStandings } from './mockArenaData'
import styles from './PUBGArena.module.css'
import { usePubgAirdropTimer } from './usePubgAirdropTimer'

export default function PUBGArena() {
  const airdropInventory = mockCrateDrops.status === 'ready'
    ? mockCrateDrops.data[0]?.inventory ?? 0
    : 0
  const countdown = usePubgAirdropTimer({
    targetTimestamp: mockPubgPhase.targetTimestamp,
    liveUntilTimestamp: mockPubgPhase.liveUntilTimestamp,
    inventory: airdropInventory,
  })
  const ticketCount = mockPubgTickets.status === 'ready'
    ? mockPubgTickets.data.reduce((count, ticket) => count + ticket.inventory, 0)
    : 0

  return (
    <div className={styles.shell}>
      <ChampionshipHeader />
      <main className={styles.page}>
        <div className={styles.titleLine}>
          <div>
            <p className={styles.eyebrow}>PUBG Vietnam Championship</p>
            <h1>KRAFTON <span>×</span> PUBG Vietnam</h1>
          </div>
          <div className={styles.mockNotice} role="note">
            <span aria-hidden="true">◆</span> LOCAL MOCK DATA <i>·</i> API NOT CONNECTED
          </div>
        </div>

        <AirdropCountdownPanel phase={mockPubgPhase} countdown={countdown} />

        <div className={styles.metrics} aria-label="Arena overview">
          <div><span className={styles.metricIcon}>◉</span><span><small>COMPETING SQUADS</small><strong>04</strong></span></div>
          <div><span className={styles.metricIcon}>▣</span><span><small>AVAILABLE DROPS</small><strong>{mockCrateDrops.status === 'ready' ? String(mockCrateDrops.data.length).padStart(2, '0') : '—'}</strong></span></div>
          <div><span className={styles.metricIcon}>◈</span><span><small>TICKETS IN INVENTORY</small><strong>{String(ticketCount).padStart(2, '0')}</strong></span></div>
          <div className={styles.metricLocation}><span><small>DROP ZONE</small><strong>VIETNAM SERVER</strong></span><span className={styles.signal} aria-hidden="true">▂▄▆█</span></div>
        </div>

        <section className={styles.section} id="rewards" aria-labelledby="rewards-title">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>Secure your loadout</p><h2 id="rewards-title">Airdrop rewards</h2></div>
            <span className={styles.sectionIndex}>01 <i>/</i> REWARDS</span>
          </div>
          <RewardGrid drops={mockCrateDrops} tickets={mockPubgTickets} canClaim={countdown.isClaimable} />
          <p className={styles.mockFootnote}>Prices and inventory are sample values for this local mock dashboard. The timer gates the claim window; claim requests are implemented in T03.</p>
        </section>

        <section className={styles.leaderboardSection} id="leaderboard" aria-labelledby="leaderboard-title">
          <div className={styles.leaderboardIntro}>
            <p className={styles.eyebrow}>Championship standings</p>
            <h2 id="leaderboard-title">Vietnam squad<br /><span>leaderboard.</span></h2>
            <p>Every placement counts. Every elimination moves the line.</p>
            <div className={styles.scoreLegend}><span><i className={styles.placementDot} /> PLACEMENT</span><span><i className={styles.eliminationDot} /> ELIMINATION</span></div>
          </div>
          <div className={styles.leaderboardCard}>
            <div className={styles.leaderboardHeader}><div><span>RANKED SQUADS</span><strong>TOP 04</strong></div><span className={styles.season}>PVS · VN</span></div>
            <LeaderboardPanel standings={mockSquadStandings} />
            <p className={styles.pointsHint}>Points shown are combined placement and elimination totals.</p>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>KRAFTON × PUBG VIETNAM <i>·</i> CHAMPIONSHIP ARENA</span>
        <Link to="/">Back to Lab 3 homeworks <span aria-hidden="true">↗</span></Link>
      </footer>
    </div>
  )
}
