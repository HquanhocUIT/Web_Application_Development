import { useState } from 'react'
import { Link } from 'react-router-dom'
import AirdropCountdownPanel from './components/AirdropCountdownPanel'
import ChampionshipHeader from './components/ChampionshipHeader'
import LeaderboardPanel from './components/LeaderboardPanel'
import RewardGrid from './components/RewardGrid'
import { mockCrateDrops, mockPubgPhase, mockPubgTickets, mockSquadStandings } from './mockArenaData'
import { pubgClaimApi, mockPubgClaimableItems } from './pubgClaimApi'
import { getPubgPhaseConfig } from './pubgPhaseConfig'
import styles from './PUBGArena.module.css'
import type { PubgCrateDrop, PubgMockDataState, PubgTicket } from './types'
import { usePubgAirdropClaims } from './usePubgAirdropClaims'
import { usePubgAirdropTimer } from './usePubgAirdropTimer'

function syncInventory<T extends { id: string; inventory: number }>(
  data: PubgMockDataState<T>,
  inventories: Readonly<Record<string, number>>,
): PubgMockDataState<T> {
  if (data.status !== 'ready') return data
  return { status: 'ready', data: data.data.map((item) => ({ ...item, inventory: inventories[item.id] ?? 0 })) }
}

export default function PUBGArena() {
  const [{ phase, isTestMode }] = useState(() => getPubgPhaseConfig(
    mockPubgPhase,
    import.meta.env.DEV,
    window.location.search,
    Date.now(),
  ))
  const claims = usePubgAirdropClaims(mockPubgClaimableItems, pubgClaimApi)
  const currentDrops: PubgMockDataState<PubgCrateDrop> = syncInventory(mockCrateDrops, claims.inventories)
  const currentTickets: PubgMockDataState<PubgTicket> = syncInventory(mockPubgTickets, claims.inventories)
  const airdropInventory = currentDrops.status === 'ready'
    ? currentDrops.data.reduce((total, drop) => total + drop.inventory, 0)
    : 0
  const countdown = usePubgAirdropTimer({
    targetTimestamp: phase.targetTimestamp,
    liveUntilTimestamp: phase.liveUntilTimestamp,
    inventory: airdropInventory,
  })
  const ticketCount = currentTickets.status === 'ready'
    ? currentTickets.data.reduce((count, ticket) => count + ticket.inventory, 0)
    : 0

  return (
    <div className={styles.shell}>
      <ChampionshipHeader />
      <main className={styles.page}>
        <div className={styles.titleLine}>
          <div>
            <p className={styles.eyebrow}>PVS Grand Finals · PUBG Vietnam Championship</p>
            <h1>KRAFTON <span>×</span> PUBG Vietnam</h1>
          </div>
          <div className={styles.mockNotice} role="note">
            <span aria-hidden="true">◆</span> LOCAL MOCK DATA <i>·</i> API NOT CONNECTED
          </div>
        </div>

        {isTestMode && <div className={styles.mockNotice} role="note">DEV TEST MODE · COUNTDOWN OPENS IN 10 SECONDS</div>}
        <AirdropCountdownPanel phase={phase} countdown={countdown} />

        <div className={styles.metrics} aria-label="Arena overview">
          <div><span className={styles.metricIcon}>◉</span><span><small>COMPETING SQUADS</small><strong>04</strong></span></div>
          <div><span className={styles.metricIcon}>▣</span><span><small>AVAILABLE DROPS</small><strong>{currentDrops.status === 'ready' ? String(currentDrops.data.filter((drop) => drop.inventory > 0).length).padStart(2, '0') : '—'}</strong></span></div>
          <div><span className={styles.metricIcon}>◈</span><span><small>TICKETS IN INVENTORY</small><strong>{String(ticketCount).padStart(2, '0')}</strong></span></div>
          <div className={styles.metricLocation}><span><small>DROP ZONE</small><strong>VIETNAM SERVER</strong></span><span className={styles.signal} aria-hidden="true">▂▄▆█</span></div>
        </div>

        <section className={styles.section} id="rewards" aria-labelledby="rewards-title">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>Secure your loadout</p><h2 id="rewards-title">Airdrop rewards</h2></div>
            <span className={styles.sectionIndex}>01 <i>/</i> REWARDS</span>
          </div>
          <RewardGrid
            drops={currentDrops}
            tickets={currentTickets}
            canClaim={countdown.isClaimable}
            inventories={claims.inventories}
            pendingIds={claims.pendingIds}
            messages={claims.messages}
            onClaim={claims.claim}
          />
          <p className={styles.mockFootnote}>Prices are sample values. Inventory is reconciled with the local mock claim service; claim requests are enabled only during a live airdrop window.</p>
        </section>

        <section className={styles.leaderboardSection} id="leaderboard" aria-labelledby="leaderboard-title">
          <div className={styles.leaderboardIntro}>
            <p className={styles.eyebrow}>Championship standings</p>
            <h2 id="leaderboard-title">Vietnam squad<br /><span>leaderboard.</span></h2>
            <p>Every placement counts. Every kill can shift the standings.</p>
            <div className={styles.scoreLegend}><span><i className={styles.placementDot} /> PLACEMENT</span><span><i className={styles.killDot} /> KILL POINTS</span></div>
          </div>
          <div className={styles.leaderboardCard}>
            <div className={styles.leaderboardHeader}><div><span>RANKED SQUADS</span><strong>TOP 04</strong></div><span className={styles.season}>PVS · VN</span></div>
            <LeaderboardPanel standings={mockSquadStandings} />
            <p className={styles.pointsHint}>Total points combine placement points and kill points.</p>
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
