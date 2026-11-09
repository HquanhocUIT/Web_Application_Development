import { describe, expect, it } from 'vitest'
import { filterAndSortSquads } from './leaderboardUtils'
import type { PubgVnSquadStanding } from './types'

const squads: PubgVnSquadStanding[] = [
  { id: 'alpha', name: 'Alpha', tag: 'A', region: 'Vietnam', wwcd: 2, placementPoints: 30, killPoints: 10 },
  { id: 'bravo', name: 'Bravo', tag: 'B', region: 'Vietnam', wwcd: 0, placementPoints: 12, killPoints: 24 },
  { id: 'charlie', name: 'Charlie', tag: 'C', region: 'Vietnam', wwcd: 1, placementPoints: 10, killPoints: 8 },
]

describe('PUBG leaderboard filtering and sorting', () => {
  it('filters on WWCD, placement points and kill points', () => {
    expect(filterAndSortSquads(squads, 'wwcd', 'wwcd').map((squad) => squad.id)).toEqual(['alpha', 'charlie'])
    expect(filterAndSortSquads(squads, 'placementPoints', 'placementPoints').map((squad) => squad.id)).toEqual(['alpha', 'bravo', 'charlie'])
    expect(filterAndSortSquads(squads, 'killPoints', 'killPoints').map((squad) => squad.id)).toEqual(['bravo', 'alpha', 'charlie'])
  })

  it('sorts independently by WWCD, placement points, kill points and total points', () => {
    expect(filterAndSortSquads(squads, 'all', 'wwcd').map((squad) => squad.id)).toEqual(['alpha', 'charlie', 'bravo'])
    expect(filterAndSortSquads(squads, 'all', 'placementPoints').map((squad) => squad.id)).toEqual(['alpha', 'bravo', 'charlie'])
    expect(filterAndSortSquads(squads, 'all', 'killPoints').map((squad) => squad.id)).toEqual(['bravo', 'alpha', 'charlie'])
    expect(filterAndSortSquads(squads, 'all', 'totalPoints').map((squad) => squad.id)).toEqual(['alpha', 'bravo', 'charlie'])
  })

  it('supports ascending order, deterministic ties and does not mutate source data', () => {
    const sourceOrder = squads.map((squad) => squad.id)
    expect(filterAndSortSquads(squads, 'all', 'wwcd', 'ascending').map((squad) => squad.id)).toEqual(['bravo', 'charlie', 'alpha'])
    expect(squads.map((squad) => squad.id)).toEqual(sourceOrder)
  })
})
