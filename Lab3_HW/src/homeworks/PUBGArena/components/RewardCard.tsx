import type { PubgCrateDrop, PubgTicket } from '../types'
import { formatVnd } from '../formatVnd'
import styles from './RewardCard.module.css'

type Props =
  | { reward: PubgCrateDrop; kind: 'drop'; canClaim: boolean }
  | { reward: PubgTicket; kind: 'ticket'; canClaim: boolean }

export default function RewardCard({ reward, kind, canClaim }: Props) {
  const isDrop = kind === 'drop'
  const title = reward.name
  const subtitle = isDrop ? reward.subtitle : 'ARENA ACCESS'
  const description = reward.description
  const tier = isDrop ? reward.tier : 'ENTRY'

  return (
    <article className={`${styles.card} ${isDrop ? styles.dropCard : styles.ticketCard}`}>
      <div className={styles.cardTop}>
        <span className={styles.rewardIcon} aria-hidden="true">{isDrop ? '▣' : '◈'}</span>
        <span className={styles.tier}>{tier}</span>
      </div>
      <p className={styles.subtitle}>{subtitle}</p>
      <h3>{title}</h3>
      <p className={styles.description}>{description}</p>
      <div className={styles.rewardValue}>
        {isDrop && <span className={styles.coinIcon} aria-hidden="true">G</span>}
        <strong>{isDrop ? reward.rewardLabel : 'EVENT ACCESS'}</strong>
      </div>
      <div className={styles.purchaseRow}>
        <div>
          <span className={styles.priceLabel}>PRICE</span>
          <strong className={styles.price}>{formatVnd(reward.priceVnd)}</strong>
        </div>
        <div className={styles.stock}>
          <span className={styles.priceLabel}>AVAILABLE</span>
          <strong>{reward.inventory.toLocaleString('vi-VN')} <small>units</small></strong>
        </div>
      </div>
      <button
        className={styles.claimButton}
        type="button"
        disabled={!canClaim}
        aria-label={canClaim ? `Claim ${title}; claim service arrives in T03` : `Claim ${title} unavailable until the airdrop is live`}
      >
        {canClaim ? 'AIRDROP LIVE · CLAIM FLOW T03' : 'CLAIMS OPEN WHEN LIVE'} <span aria-hidden="true">↗</span>
      </button>
    </article>
  )
}
