import type {
  PubgCrateDrop,
  PubgMockDataState,
  PubgPhase,
  PubgTicket,
  PubgVnSquadStanding,
} from './types'

/** Local presentation data only; replace behind a service layer when an API exists. */
export const mockPubgPhase: PubgPhase = {
  id: 'pvs-grand-finals',
  name: 'PVS Grand Finals',
  subtitle: 'THE FINAL DROP ZONE',
  status: 'WARMUP',
  targetTimestamp: Date.now() + 24 * 60 * 1000,
  arenaName: 'Ho Chi Minh City · Vietnam',
}

export const mockCrateDrops: PubgMockDataState<PubgCrateDrop> = {
  status: 'ready',
  data: [
    {
      id: 'grand-finals-vip',
      name: 'Grand Finals VIP Pass',
      subtitle: 'PVS GRAND FINALS',
      description: 'VIP arena access + 5,000 G-Coin',
      priceVnd: 1_250_000,
      inventory: 24,
      rewardLabel: '5,000 G-COIN',
      tier: 'LEGENDARY',
    },
    {
      id: 'g-coin-crate',
      name: 'G-Coin Supply Crate',
      subtitle: 'CHAMPIONSHIP DROP',
      description: 'A curated G-Coin crate for your next loadout.',
      priceVnd: 250_000,
      inventory: 180,
      rewardLabel: '2,500 G-COIN',
      tier: 'EPIC',
    },
  ],
}

export const mockPubgTickets: PubgMockDataState<PubgTicket> = {
  status: 'ready',
  data: [
    {
      id: 'arena-entry',
      name: 'Arena Entry Ticket',
      description: 'One ticket in your squad inventory',
      priceVnd: 150_000,
      inventory: 1,
    },
    {
      id: 'supply-ticket',
      name: 'Supply Drop Ticket',
      description: 'Redeemable during a live airdrop window',
      priceVnd: 75_000,
      inventory: 3,
    },
  ],
}

export const mockSquadStandings: PubgMockDataState<PubgVnSquadStanding> = {
  status: 'ready',
  data: [
    { id: 'the-expendables', name: 'The Expendables', tag: 'EXP', region: 'Vietnam', placementPoints: 74, eliminationPoints: 68, wins: 3, trend: 'up' },
    { id: 'cerberus-esports', name: 'Cerberus Esports', tag: 'CES', region: 'Vietnam', placementPoints: 70, eliminationPoints: 65, wins: 2, trend: 'steady' },
    { id: 'roy-esports', name: 'Roy Esports', tag: 'ROY', region: 'Vietnam', placementPoints: 61, eliminationPoints: 60, wins: 2, trend: 'up' },
    { id: 'agg', name: 'AGG', tag: 'AGG', region: 'Vietnam', placementPoints: 56, eliminationPoints: 58, wins: 1, trend: 'down' },
  ],
}
