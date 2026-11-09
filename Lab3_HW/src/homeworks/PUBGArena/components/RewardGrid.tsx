import type { PubgCrateDrop, PubgMockDataState, PubgTicket } from '../types'
import RewardCard from './RewardCard'
import styles from './RewardGrid.module.css'

type Props = {
  drops: PubgMockDataState<PubgCrateDrop>
  tickets: PubgMockDataState<PubgTicket>
}

export default function RewardGrid({ drops, tickets }: Props) {
  if (drops.status === 'loading' || tickets.status === 'loading') {
    return <p className={styles.state} role="status">Loading arena rewards…</p>
  }
  if (drops.status === 'error' || tickets.status === 'error') {
    const message = drops.status === 'error' ? drops.message : tickets.status === 'error' ? tickets.message : 'Rewards could not be loaded.'
    return <p className={`${styles.state} ${styles.error}`} role="alert">{message}</p>
  }
  const dropItems = drops.status === 'ready' ? drops.data : []
  const ticketItems = tickets.status === 'ready' ? tickets.data : []
  if (dropItems.length === 0 && ticketItems.length === 0) {
    return <p className={styles.state} role="status">No rewards are available right now. Check back before the next drop.</p>
  }

  return (
    <div className={styles.grid}>
      {dropItems.map((drop) => <RewardCard key={drop.id} reward={drop} kind="drop" />)}
      {ticketItems.map((ticket) => <RewardCard key={ticket.id} reward={ticket} kind="ticket" />)}
    </div>
  )
}
