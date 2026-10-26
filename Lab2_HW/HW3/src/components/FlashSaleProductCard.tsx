import type { FlashSalePhase } from '../domain/flashSaleCountdown'
import type { FlashSaleProduct } from '../data/flashSaleProducts'
import type { InventoryState } from '../domain/flashSale.types'
import { getAvailableQuantity } from '../domain/flashSaleSession'
import { ReservationPanel } from './ReservationPanel'

export interface FlashSaleProductCardProps {
  product: FlashSaleProduct
  inventoryState: InventoryState
  salePhase: FlashSalePhase
  isPurchasePending: boolean
  onBuy: (product: FlashSaleProduct) => void
  onCheckout: (productId: string, reservationId: string, paymentStatus: 'approved' | 'declined') => void
  onCancel: (productId: string, reservationId: string) => void
}

function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)}₫`
}

export function FlashSaleProductCard({
  product,
  inventoryState,
  salePhase,
  isPurchasePending,
  onBuy,
  onCheckout,
  onCancel,
}: FlashSaleProductCardProps) {
  const discount = Math.round((1 - product.salePriceVnd / product.originalPriceVnd) * 100)
  const availableQuantity = getAvailableQuantity(inventoryState)
  const { soldQuantity, totalQuantity } = inventoryState.inventory
  const soldPercent = totalQuantity === 0 ? 100 : Math.round((soldQuantity / totalQuantity) * 100)
  const isSoldOut = availableQuantity <= 0
  const isDisabled = isSoldOut || salePhase !== 'active'
  const buttonLabel = isPurchasePending
    ? 'Đang giữ hàng…'
    : isSoldOut
    ? 'Đã bán hết'
    : salePhase === 'upcoming'
      ? 'Sắp mở bán'
      : salePhase === 'ended' || salePhase === 'invalid'
        ? 'Đã kết thúc'
        : 'Mua ngay'

  return (
    <article className={`product-card product-card--${product.accent}`}>
      <div className="product-card__visual" aria-hidden="true">
        <span className="product-card__badge">{product.label}</span>
        <span className="product-card__icon">{product.icon}</span>
        {isSoldOut && <span className="product-card__sold-overlay">ĐÃ HẾT HÀNG</span>}
      </div>

      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="product-card__description">{product.description}</p>

        <div className="product-card__price-row">
          <p className="product-card__sale-price">{formatVnd(product.salePriceVnd)}</p>
          <p className="product-card__original-price">{formatVnd(product.originalPriceVnd)}</p>
          <span className="product-card__discount">-{discount}%</span>
        </div>

        <div className="stock-meter">
          <div className="stock-meter__labels">
            <span>{isSoldOut ? 'Đã bán hết' : `Còn ${availableQuantity} sản phẩm`}</span>
            <span>{soldPercent}% đã bán</span>
          </div>
          <progress
            className="stock-meter__progress"
            value={product.soldQuantity}
            max={totalQuantity}
            aria-label={`Đã bán ${soldQuantity} trên ${totalQuantity} sản phẩm`}
          />
        </div>

        <ReservationPanel
          reservations={inventoryState.reservations.filter((reservation) => reservation.status === 'reserved')}
          onCheckout={(reservationId, paymentStatus) =>
            onCheckout(product.id, reservationId, paymentStatus)}
          onCancel={(reservationId) => onCancel(product.id, reservationId)}
        />

        <button
          className="buy-button"
          type="button"
          disabled={isDisabled || isPurchasePending}
          onClick={() => onBuy(product)}
          aria-label={`${buttonLabel}: ${product.name}`}
        >
          {buttonLabel}
          {!isDisabled && <span aria-hidden="true">→</span>}
        </button>
      </div>
    </article>
  )
}
