export type ReservationStatus =
  | 'pending'
  | 'reserved'
  | 'expired'
  | 'checked_out'
  | 'cancelled'

export interface Product {
  id: string
  name: string
  priceVnd: number
  saleStartsAt: number
  saleEndsAt: number
}

/** Inventory quantities are whole, non-negative units for one product. */
export interface Inventory {
  productId: string
  totalQuantity: number
  reservedQuantity: number
  soldQuantity: number
  version: number
}

/** A display snapshot; availableQuantity is derived, never independently stored. */
export interface InventorySnapshot extends Inventory {
  availableQuantity: number
}

/** A pending reservation has no expiry; reserved reservations have an epoch-ms expiry. */
export interface Reservation {
  id: string
  productId: string
  quantity: number
  status: ReservationStatus
  createdAt: number
  expiresAt: number | null
  updatedAt: number
  inventoryVersion: number
}

/** State for one product. All reservations in this state must match inventory.productId. */
export interface InventoryState {
  inventory: Inventory
  reservations: Reservation[]
}
