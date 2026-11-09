import type { PubgVnSquadStanding } from './types'

export type PubgSquadFilter = 'all' | 'wwcd' | 'placementPoints' | 'killPoints'
export type PubgSquadSort = 'wwcd' | 'placementPoints' | 'killPoints' | 'totalPoints'
export type SortDirection = 'ascending' | 'descending'

export function getSquadMetric(squad: PubgVnSquadStanding, metric: PubgSquadSort): number {
  if (metric === 'totalPoints') return squad.placementPoints + squad.killPoints
  return squad[metric]
}

export function filterAndSortSquads(
  squads: readonly PubgVnSquadStanding[],
  filter: PubgSquadFilter,
  sortBy: PubgSquadSort,
  direction: SortDirection = 'descending',
): PubgVnSquadStanding[] {
  const filtered = squads.filter((squad) => filter === 'all' || squad[filter] > 0)
  const directionFactor = direction === 'descending' ? -1 : 1

  return filtered.sort((first, second) => {
    const difference = getSquadMetric(first, sortBy) - getSquadMetric(second, sortBy)
    if (difference !== 0) return difference * directionFactor
    const nameOrder = first.name.localeCompare(second.name, 'vi')
    return nameOrder || first.id.localeCompare(second.id)
  })
}
