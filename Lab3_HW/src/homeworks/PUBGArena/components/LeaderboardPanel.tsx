import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { PubgMockDataState, PubgVnSquadStanding } from '../types'
import { filterAndSortSquads } from '../leaderboardUtils'
import type { PubgSquadFilter, PubgSquadSort, SortDirection } from '../leaderboardUtils'
import styles from './LeaderboardPanel.module.css'

type Props = { standings: PubgMockDataState<PubgVnSquadStanding> }

export default function LeaderboardPanel({ standings }: Props) {
  const [filter, setFilter] = useState<PubgSquadFilter>('all')
  const [sortBy, setSortBy] = useState<PubgSquadSort>('totalPoints')
  const [direction, setDirection] = useState<SortDirection>('descending')

  if (standings.status === 'loading') return <p className={styles.state} role="status">Loading squad standings…</p>
  if (standings.status === 'error') return <p className={`${styles.state} ${styles.error}`} role="alert">{standings.message}</p>
  if (standings.status === 'empty' || standings.data.length === 0) {
    return <p className={styles.state} role="status">No squad standings are available yet.</p>
  }

  const rankedSquads = filterAndSortSquads(standings.data, filter, sortBy, direction)
  return (
    <>
      <div className={styles.controls}>
        <label>
          <span>FILTER SQUADS</span>
          <select aria-label="Filter squads by metric" value={filter} onChange={(event: ChangeEvent<HTMLSelectElement>) => setFilter(event.currentTarget.value as PubgSquadFilter)}>
            <option value="all">All squads</option>
            <option value="wwcd">WWCD teams</option>
            <option value="placementPoints">Placement scorers</option>
            <option value="killPoints">Kill scorers</option>
          </select>
        </label>
        <label>
          <span>SORT BY</span>
          <select aria-label="Sort squads by metric" value={sortBy} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSortBy(event.currentTarget.value as PubgSquadSort)}>
            <option value="totalPoints">Total points</option>
            <option value="wwcd">WWCD</option>
            <option value="placementPoints">Placement points</option>
            <option value="killPoints">Kill points</option>
          </select>
        </label>
        <button
          className={styles.directionButton}
          type="button"
          aria-label={`Sort ${direction === 'descending' ? 'ascending' : 'descending'}`}
          onClick={() => setDirection((current) => current === 'descending' ? 'ascending' : 'descending')}
        >
          {direction === 'descending' ? 'DESC ↓' : 'ASC ↑'}
        </button>
      </div>
      {rankedSquads.length === 0 ? (
        <p className={styles.state} role="status">No squads match this leaderboard filter.</p>
      ) : (
        <>
          <div className={styles.metricHeader} aria-hidden="true">
            <span>RANK / SQUAD</span><span>WWCD</span><span>PLACEMENT PTS</span><span>KILL PTS</span><span>TOTAL PTS</span>
          </div>
          <ol className={styles.list} aria-label="PUBG Vietnam squad standings">
            {rankedSquads.map((squad, index) => (
              <li className={`${styles.row} ${index === 0 ? styles.topRow : ''}`} key={squad.id}>
                <span className={styles.rank}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.teamMark} aria-hidden="true">{squad.tag}</span>
                <span className={styles.teamName}>
                  <strong>{squad.name}</strong>
                  <small>{squad.region}</small>
                </span>
                <span className={styles.metric} aria-label={`WWCD ${squad.wwcd}`}>{squad.wwcd}</span>
                <span className={styles.metric} aria-label={`Placement points ${squad.placementPoints}`}>{squad.placementPoints}</span>
                <span className={styles.metric} aria-label={`Kill points ${squad.killPoints}`}>{squad.killPoints}</span>
                <span className={styles.total}>{squad.placementPoints + squad.killPoints}</span>
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  )
}
