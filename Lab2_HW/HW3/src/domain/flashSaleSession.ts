import { OptimisticInventoryEngine } from './optimisticInventoryEngine.ts'
import type { InventoryState, Product } from './flashSale.types'

export interface FlashSaleInventorySetup {
  id: string
  name: string
  priceVnd: number
  totalQuantity: number
  soldQuantity: number
}

export function createFlashSaleEngines(
  products: FlashSaleInventorySetup[],
  saleStartsAt: number,
  saleEndsAt: number,
): Map<string, OptimisticInventoryEngine> {
  return new Map(products.map((item) => {
    const product: Product = {
      id: item.id,
      name: item.name,
      priceVnd: item.priceVnd,
      saleStartsAt,
      saleEndsAt,
    }
    const initialState: InventoryState = {
      inventory: {
        productId: item.id,
        totalQuantity: item.totalQuantity,
        reservedQuantity: 0,
        soldQuantity: item.soldQuantity,
        version: 0,
      },
      reservations: [],
    }

    return [item.id, new OptimisticInventoryEngine(product, initialState)]
  }))
}

export function getAvailableQuantity(state: InventoryState): number {
  return state.inventory.totalQuantity -
    state.inventory.soldQuantity -
    state.inventory.reservedQuantity
}
