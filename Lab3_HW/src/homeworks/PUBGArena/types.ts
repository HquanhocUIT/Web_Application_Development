export type PubgPhaseStatus = 'WARMUP' | 'AIRDROP_LIVE' | 'LOOTED_OUT' | 'EXPIRED'

export interface PubgPhase {
  id: string
  name: string
  subtitle: string
  status: PubgPhaseStatus
  targetTimestamp: number
  arenaName: string
}

export interface PubgCrateDrop {
  id: string
  name: string
  subtitle: string
  description: string
  priceVnd: number
  inventory: number
  rewardLabel: string
  tier: 'LEGENDARY' | 'EPIC' | 'RARE'
}

export interface PubgTicket {
  id: string
  name: string
  description: string
  priceVnd: number
  inventory: number
}

export interface PubgVnSquadStanding {
  id: string
  name: string
  tag: string
  region: string
  placementPoints: number
  eliminationPoints: number
  wins: number
  trend: 'up' | 'steady' | 'down'
}

export type PubgMockDataState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; data: T[] }
