import type { PubgCrateDrop, PubgMockDataState, PubgTicket } from '../types'
import type { PubgClaimMessage } from '../usePubgAirdropClaims'
import RewardCard from './RewardCard'
import styles from './RewardGrid.module.css'

type Props = {
  drops: PubgMockDataState<PubgCrateDrop>
  tickets: PubgMockDataState<PubgTicket>
  canClaim: boolean
  inventories: Readonly<Record<string, number>>
  pendingIds: ReadonlySet<string>
  messages: readonly PubgClaimMessage[]
  onClaim: (itemId: string) => Promise<void>
}

export default function RewardGrid({ drops, tickets, canClaim, inventories, pendingIds, messages, onClaim }: Props) {
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
    <>
      <div className={styles.grid}>
        {dropItems.map((drop) => <RewardCard key={drop.id} reward={drop} kind="drop" canClaim={canClaim} inventory={inventories[drop.id] ?? 0} isPending={pendingIds.has(drop.id)} onClaim={onClaim} />)}
        {ticketItems.map((ticket) => <RewardCard key={ticket.id} reward={ticket} kind="ticket" canClaim={canClaim} inventory={inventories[ticket.id] ?? 0} isPending={pendingIds.has(ticket.id)} onClaim={onClaim} />)}
      </div>
      {messages.length > 0 && (
        <div className={styles.messages} aria-live="polite" aria-relevant="additions">
          {messages.map((message) => (
            <p className={message.kind === 'success' ? styles.success : styles.error} key={message.id} role={message.kind === 'success' ? 'status' : 'alert'}>
              {message.text}
            </p>
          ))}
        </div>
      )}
    </>
  )
}
