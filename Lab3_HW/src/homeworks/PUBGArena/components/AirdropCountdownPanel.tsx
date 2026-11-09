import type { PubgPhase } from '../types'
import type { PubgAirdropTimerSnapshot } from '../usePubgAirdropTimer'
import styles from './AirdropCountdownPanel.module.css'

type Props = { phase: PubgPhase; countdown: PubgAirdropTimerSnapshot }

function formatUnit(value: number): string {
  return String(value).padStart(2, '0')
}

export default function AirdropCountdownPanel({ phase, countdown }: Props) {
  const countdownLabel = countdown.status === 'WARMUP'
    ? 'DROP WINDOW OPENS IN'
    : countdown.status === 'EXPIRED'
      ? 'DROP WINDOW CLOSED'
      : 'DROP WINDOW CLOSES IN'

  return (
    <section className={styles.panel} id="airdrop" aria-labelledby="airdrop-title">
      <div className={styles.artwork} aria-hidden="true">
        <span className={styles.orbit} />
        <span className={styles.crate}><i /><b /><em /></span>
        <span className={styles.dropLabel}>SUPPLY DROP // 01</span>
      </div>
      <div className={styles.content}>
        <div className={styles.phaseLine} role="status" aria-live="polite">
          <span className={styles.phaseDot} /> {countdown.status.replaceAll('_', ' ')}
          <span className={styles.phaseDivider}>/</span> {phase.arenaName}
        </div>
        <p className={styles.kicker}>{phase.subtitle}</p>
        <h2 id="airdrop-title">The next drop<br /><span>changes everything.</span></h2>
        <p className={styles.description}>Squad up. Secure your ticket. Get ready to claim championship loot when the arena goes live.</p>
        <div className={styles.timerBlock}>
          <div className={styles.timerLabel}><span>{countdownLabel}</span></div>
          <div className={styles.timer} role="timer" aria-live="off" aria-label={`${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, ${countdown.seconds} seconds`}>
            <span className={styles.timerUnit}><strong>{formatUnit(countdown.days)}</strong><small>DAYS</small></span>
            <b>:</b>
            <span className={styles.timerUnit}><strong>{formatUnit(countdown.hours)}</strong><small>HOURS</small></span>
            <b>:</b>
            <span className={styles.timerUnit}><strong>{formatUnit(countdown.minutes)}</strong><small>MIN</small></span>
            <b>:</b>
            <span className={styles.timerUnit}><strong>{formatUnit(countdown.seconds)}</strong><small>SEC</small></span>
          </div>
          <p>{countdown.isClaimable ? 'Airdrop is live · claim window open.' : countdown.status === 'LOOTED_OUT' ? 'This drop has been looted out.' : countdown.status === 'EXPIRED' ? 'This airdrop window has expired.' : 'Countdown synced to the event target time.'}</p>
        </div>
        <a className={styles.action} href="#rewards">{countdown.isClaimable ? 'View live airdrop' : 'Explore available drops'} <span aria-hidden="true">↘</span></a>
      </div>
      <div className={styles.heroFooter} aria-hidden="true">
        <span>ERANGEL // VIETNAM</span><span>01 — 04 / SQUAD ARENA</span>
      </div>
    </section>
  )
}
