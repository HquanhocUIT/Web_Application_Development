import type { PubgPhase } from '../types'
import styles from './AirdropCountdownPanel.module.css'

type Props = { phase: PubgPhase }

export default function AirdropCountdownPanel({ phase }: Props) {
  return (
    <section className={styles.panel} id="airdrop" aria-labelledby="airdrop-title">
      <div className={styles.artwork} aria-hidden="true">
        <span className={styles.orbit} />
        <span className={styles.crate}><i /><b /><em /></span>
        <span className={styles.dropLabel}>SUPPLY DROP // 01</span>
      </div>
      <div className={styles.content}>
        <div className={styles.phaseLine}>
          <span className={styles.phaseDot} /> {phase.status.replaceAll('_', ' ')}
          <span className={styles.phaseDivider}>/</span> {phase.arenaName}
        </div>
        <p className={styles.kicker}>{phase.subtitle}</p>
        <h2 id="airdrop-title">The next drop<br /><span>changes everything.</span></h2>
        <p className={styles.description}>Squad up. Secure your ticket. Get ready to claim championship loot when the arena goes live.</p>
        <div className={styles.timerBlock} aria-label="Countdown preview; live timer is not active yet">
          <div className={styles.timerLabel}><span>DROP WINDOW OPENS IN</span><span className={styles.previewTag}>TIMER PREVIEW</span></div>
          <div className={styles.timer} aria-hidden="true"><span>--</span><b>:</b><span>--</span><b>:</b><span>--</span></div>
          <p>Live countdown unlocks in the next milestone.</p>
        </div>
        <a className={styles.action} href="#rewards">Explore available drops <span aria-hidden="true">↘</span></a>
      </div>
      <div className={styles.heroFooter} aria-hidden="true">
        <span>ERANGEL // VIETNAM</span><span>01 — 04 / SQUAD ARENA</span>
      </div>
    </section>
  )
}
