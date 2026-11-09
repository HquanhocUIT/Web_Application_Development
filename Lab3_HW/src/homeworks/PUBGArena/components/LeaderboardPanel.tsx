import type { PubgMockDataState, PubgVnSquadStanding } from '../types'
import styles from './LeaderboardPanel.module.css'

type Props = { standings: PubgMockDataState<PubgVnSquadStanding> }

function totalPoints(squad: PubgVnSquadStanding): number {
  return squad.placementPoints + squad.eliminationPoints
}

export default function LeaderboardPanel({ standings }: Props) {
  if (standings.status === 'loading') return <p className={styles.state} role="status">Loading squad standings…</p>
  if (standings.status === 'error') return <p className={`${styles.state} ${styles.error}`} role="alert">{standings.message}</p>
  if (standings.status === 'empty' || standings.data.length === 0) {
    return <p className={styles.state} role="status">No squad standings are available yet.</p>
  }

  const rankedSquads = [...standings.data].sort((first, second) => totalPoints(second) - totalPoints(first))
  return (
    <ol className={styles.list} aria-label="PUBG Vietnam squad standings">
      {rankedSquads.map((squad, index) => (
        <li className={`${styles.row} ${index === 0 ? styles.topRow : ''}`} key={squad.id}>
          <span className={styles.rank}>{String(index + 1).padStart(2, '0')}</span>
          <span className={styles.teamMark} aria-hidden="true">{squad.tag}</span>
          <span className={styles.teamName}>
            <strong>{squad.name}</strong>
            <small>{squad.region} · {squad.wins} {squad.wins === 1 ? 'win' : 'wins'}</small>
          </span>
          <span className={styles.points}>
            <strong>{totalPoints(squad)}</strong>
            <small>PTS</small>
          </span>
          <span className={`${styles.trend} ${styles[squad.trend]}`} aria-label={`Trend ${squad.trend}`}>
            {squad.trend === 'up' ? '↗' : squad.trend === 'down' ? '↘' : '→'}
          </span>
        </li>
      ))}
    </ol>
  )
}
