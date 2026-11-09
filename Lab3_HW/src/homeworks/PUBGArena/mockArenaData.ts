import type {
  PubgCrateDrop,
  PubgMockDataState,
  PubgPhase,
  PubgTicket,
  PubgVnSquadStanding,
} from './types'

const mockDropOpensAt = Date.now() + 24 * 60 * 60 * 1000

/** Local presentation data only; replace behind a service layer when an API exists. */
export const mockPubgPhase: PubgPhase = {
  id: 'pvs-grand-finals',
  name: 'PVS Grand Finals',
  subtitle: 'THE FINAL DROP ZONE',
  targetTimestamp: mockDropOpensAt,
  liveUntilTimestamp: mockDropOpensAt + 60 * 60 * 1000,
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
    { id: 'the-expendables', name: 'The Expendables', tag: 'EXP', region: 'Vietnam', wwcd: 3, placementPoints: 74, killPoints: 68 },
    { id: 'cerberus-esports', name: 'Cerberus Esports', tag: 'CES', region: 'Vietnam', wwcd: 2, placementPoints: 70, killPoints: 65 },
    { id: 'roy-esports', name: 'Roy Esports', tag: 'ROY', region: 'Vietnam', wwcd: 2, placementPoints: 61, killPoints: 60 },
    { id: 'agg', name: 'AGG', tag: 'AGG', region: 'Vietnam', wwcd: 0, placementPoints: 56, killPoints: 58 },
  ],
}
