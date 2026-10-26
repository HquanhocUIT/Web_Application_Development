import { useCallback, useEffect, useRef, useState } from 'react'
import type { InventoryState } from '../domain/flashSale.types'
import type { InventoryFailureReason } from '../domain/inventoryMachine.types'
import { createFlashSaleEngines } from '../domain/flashSaleSession'
import type { OptimisticInventoryEngine } from '../domain/optimisticInventoryEngine'
import { FlashSaleCountdown } from './FlashSaleCountdown'
import { FlashSaleProductCard } from './FlashSaleProductCard'
import { flashSaleProducts, sampleSale, type FlashSaleProduct } from '../data/flashSaleProducts'
import {
  calculateFlashSaleCountdown,
  type FlashSalePhase,
} from '../domain/flashSaleCountdown'

const RESERVATION_TTL_MS = 30_000
const EXPIRATION_CHECK_INTERVAL_MS = 500
const RETRY_POLICY = { maxAttempts: 3 }

function getInitialSalePhase(): FlashSalePhase {
  return calculateFlashSaleCountdown(
    sampleSale.startsAt,
    sampleSale.endsAt,
    Date.now(),
  ).phase
}

function getSnapshots(
  engines: Map<string, OptimisticInventoryEngine>,
): Record<string, InventoryState> {
  return Object.fromEntries(
    [...engines].map(([productId, engine]) => [productId, engine.getState()]),
  )
}

function describeFailure(reason: InventoryFailureReason | string): string {
  switch (reason) {
    case 'insufficient_stock': return 'Hết hàng: không còn đủ số lượng để giữ.'
    case 'version_conflict':
    case 'retry_limit_reached': return 'Version conflict: tồn kho vừa được cập nhật. Hãy thử lại.'
    case 'reservation_expired': return 'Reservation đã hết hạn, hàng được trả lại kho.'
    case 'invalid_reservation_status': return 'Reservation không còn ở trạng thái có thể thao tác.'
    case 'reservation_not_found': return 'Không tìm thấy reservation.'
    case 'sale_not_active': return 'Flash Sale chưa bắt đầu hoặc đã kết thúc.'
    case 'product_mismatch': return 'Mã sản phẩm không khớp với tồn kho.'
    case 'invalid_timestamp': return 'Thời gian thao tác không hợp lệ.'
    default: return `Thao tác thất bại: ${reason}.`
  }
}

export function FlashSalePage() {
  const [engines] = useState(() =>
    createFlashSaleEngines(
      flashSaleProducts.map((product) => ({
        id: product.id,
        name: product.name,
        priceVnd: product.salePriceVnd,
        totalQuantity: product.initialQuantity,
        soldQuantity: product.soldQuantity,
      })),
      sampleSale.startsAt,
      sampleSale.endsAt,
    ),
  )

  const [inventoryByProduct, setInventoryByProduct] = useState<Record<string, InventoryState>>(
    () => getSnapshots(engines),
  )
  const [salePhase, setSalePhase] = useState<FlashSalePhase>(getInitialSalePhase)
  const [orderMessage, setOrderMessage] = useState(
    'Chọn một sản phẩm còn hàng để tạo reservation.',
  )
  const [pendingProducts, setPendingProducts] = useState<Set<string>>(() => new Set())
  const pendingProductIdsRef = useRef<Set<string>>(new Set())
  const requestSequenceRef = useRef(0)

  const syncInventorySnapshots = useCallback(() => {
    const nextSnapshots = getSnapshots(engines)
    setInventoryByProduct((previous) => {
      const hasChanged = Object.entries(nextSnapshots).some(([productId, nextState]) =>
        previous[productId]?.inventory.version !== nextState.inventory.version,
      )
      return hasChanged ? nextSnapshots : previous
    })
  }, [engines])

  const scanExpiredReservations = useCallback(() => {
    const expired: string[] = []
    for (const [productId, engine] of engines) {
      const result = engine.expireReservations(Date.now())
      if (result.status === 'processed') {
        expired.push(...result.expiredReservationIds.map((id) => `${id} (${productId})`))
      }
    }
    syncInventorySnapshots()
    if (expired.length > 0) {
      setOrderMessage(`Reservation hết hạn và đã giải phóng hàng: ${expired.join(', ')}.`)
    }
  }, [engines, syncInventorySnapshots])

  useEffect(() => {
    const timerId = window.setInterval(scanExpiredReservations, EXPIRATION_CHECK_INTERVAL_MS)
    return () => window.clearInterval(timerId)
  }, [scanExpiredReservations])

  const handlePhaseChange = useCallback((phase: FlashSalePhase) => {
    setSalePhase(phase)
    if (phase === 'ended') setOrderMessage('Phiên Flash Sale đã kết thúc. Nút mua hàng đã được khóa.')
    if (phase === 'invalid') setOrderMessage('Không thể mở phiên do thời gian không hợp lệ.')
  }, [])

  const handleBuy = useCallback(async (product: FlashSaleProduct) => {
    if (pendingProductIdsRef.current.has(product.id)) return
    pendingProductIdsRef.current.add(product.id)
    setPendingProducts(new Set(pendingProductIdsRef.current))

    const engine = engines.get(product.id)
    if (!engine) {
      setOrderMessage(`Lỗi: chưa khởi tạo inventory cho sản phẩm ${product.id}.`)
      pendingProductIdsRef.current.delete(product.id)
      setPendingProducts(new Set(pendingProductIdsRef.current))
      return
    }

    const nowMs = Date.now()
    const sequence = ++requestSequenceRef.current
    const requestId = `request-${product.id}-${nowMs}-${sequence}`
    const reservationId = `reservation-${product.id}-${nowMs}-${sequence}`
    const currentState = engine.getState()

    try {
      const result = await engine.reserve({
        request: {
          requestId,
          reservationId,
          productId: product.id,
          quantity: 1,
          expectedVersion: currentState.inventory.version,
          requestedAt: nowMs,
          reservationExpiresAt: nowMs + RESERVATION_TTL_MS,
        },
        retryPolicy: RETRY_POLICY,
      })

      syncInventorySnapshots()
      if (result.status === 'reserved') {
        const expiryText = new Date(result.reservation.expiresAt ?? 0).toLocaleTimeString('vi-VN')
        setOrderMessage(
          `Giữ hàng thành công: ${result.reservation.id}, 1 sản phẩm đến ${expiryText}.`,
        )
      } else {
        setOrderMessage(describeFailure(result.reason))
      }
    } catch {
      setOrderMessage('Lỗi khi gửi yêu cầu giữ hàng. Vui lòng thử lại.')
    } finally {
      pendingProductIdsRef.current.delete(product.id)
      setPendingProducts(new Set(pendingProductIdsRef.current))
      syncInventorySnapshots()
    }
  }, [engines, syncInventorySnapshots])

  const handleCheckout = useCallback((
    productId: string,
    reservationId: string,
    paymentStatus: 'approved' | 'declined',
  ) => {
    const engine = engines.get(productId)
    if (!engine) {
      setOrderMessage(`Lỗi: không tìm thấy inventory cho ${productId}.`)
      return
    }

    const result = engine.checkout({
      type: 'checkout',
      reservationId,
      expectedVersion: engine.getState().inventory.version,
      checkedOutAt: Date.now(),
      paymentStatus,
    })
    syncInventorySnapshots()

    if (result.status === 'rejected') {
      setOrderMessage(describeFailure(result.reason))
    } else if (result.status === 'completed') {
      setOrderMessage(`Checkout thành công cho reservation ${reservationId}.`)
    } else {
      setOrderMessage(`Thanh toán bị từ chối; reservation ${reservationId} đã hủy và hàng được trả lại kho.`)
    }
  }, [engines, syncInventorySnapshots])

  const handleCancel = useCallback((productId: string, reservationId: string) => {
    const engine = engines.get(productId)
    if (!engine) {
      setOrderMessage(`Lỗi: không tìm thấy inventory cho ${productId}.`)
      return
    }

    const result = engine.cancelReservation({
      type: 'cancel_reservation',
      reservationId,
      expectedVersion: engine.getState().inventory.version,
      cancelledAt: Date.now(),
    })
    syncInventorySnapshots()

    if (result.status === 'applied') {
      setOrderMessage(`Reservation ${reservationId} đã bị hủy; hàng đã được giải phóng.`)
    } else {
      setOrderMessage(describeFailure(result.reason))
    }
  }, [engines, syncInventorySnapshots])

  const phaseLabel = {
    upcoming: 'Sắp diễn ra',
    active: 'Đang mở bán',
    ended: 'Đã kết thúc',
    invalid: 'Chưa khả dụng',
  }[salePhase]

  return (
    <main className="storefront">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Deal Mỗi Ngày - về đầu trang">
          <span className="brand__mark" aria-hidden="true">D</span>
          <span>deal<span className="brand__accent">mỗi ngày</span></span>
        </a>
        <nav className="site-nav" aria-label="Điều hướng chính">
          <a href="#san-pham">Sản phẩm</a>
          <a href="#thong-tin">Cách hoạt động</a>
        </nav>
        <a className="header-link" href="#san-pham">Khám phá deal <span aria-hidden="true">↗</span></a>
      </header>

      <section className="sale-hero" id="top" aria-labelledby="page-title">
        <div className="sale-hero__copy">
          <p className="eyebrow"><span className="live-dot" /> ƯU ĐÃI GIỚI HẠN MỖI NGÀY</p>
          <h1 id="page-title">Deal tốt, <span>chốt thật nhanh.</span></h1>
          <p className="sale-hero__description">
            Những món đồ được yêu thích với mức giá đặc biệt. Số lượng có hạn, ưu đãi chỉ diễn ra trong thời gian ngắn.
          </p>
          <a className="hero-link" href="#san-pham">Xem ưu đãi <span aria-hidden="true">↓</span></a>
        </div>

        <div className="sale-hero__timer">
          <div className="timer-heading">
            <div>
              <p className="timer-heading__eyebrow">PHIÊN ƯU ĐÃI</p>
              <h2>Flash Sale <span>01</span></h2>
            </div>
            <span className={`sale-status sale-status--${salePhase}`}>
              <span className="sale-status__dot" />{phaseLabel}
            </span>
          </div>
          <FlashSaleCountdown
            saleStartsAt={sampleSale.startsAt}
            saleEndsAt={sampleSale.endsAt}
            onPhaseChange={handlePhaseChange}
          />
          <p className="timer-caption">Nhanh tay chọn món bạn thích trước khi ưu đãi khép lại.</p>
        </div>
        <span className="hero-spark hero-spark--one" aria-hidden="true">✳</span>
        <span className="hero-spark hero-spark--two" aria-hidden="true">✦</span>
      </section>

      {salePhase === 'ended' && (
        <p className="sale-notice sale-notice--ended" role="status">
          Phiên ưu đãi đã kết thúc. Nút mua hàng đã được khóa.
        </p>
      )}
      {salePhase === 'upcoming' && (
        <p className="sale-notice" role="status">
          Phiên chưa mở bán. Nút mua hàng sẽ hoạt động khi countdown kết thúc.
        </p>
      )}
      {salePhase === 'invalid' && (
        <p className="sale-notice sale-notice--ended" role="alert">
          Mốc thời gian của phiên không hợp lệ. Không thể đặt hàng.
        </p>
      )}

      <section className="product-section" id="san-pham" aria-labelledby="products-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">CHỌN DEAL CỦA BẠN</p>
            <h2 id="products-title">Đang được săn đón <span>✦</span></h2>
          </div>
          <p className="section-note">Giá tốt cho đến khi hết hàng hoặc hết giờ.</p>
        </div>

        <div className="product-grid">
          {flashSaleProducts.map((product) => {
            const inventoryState = inventoryByProduct[product.id]
            if (!inventoryState) return null

            return (
              <FlashSaleProductCard
                key={product.id}
                product={product}
                inventoryState={inventoryState}
                salePhase={salePhase}
                isPurchasePending={pendingProducts.has(product.id)}
                onBuy={handleBuy}
                onCheckout={handleCheckout}
                onCancel={handleCancel}
              />
            )
          })}
        </div>
      </section>

      <section className="order-feedback" id="thong-tin" aria-labelledby="feedback-title">
        <div className="order-feedback__icon" aria-hidden="true">✓</div>
        <div>
          <h2 id="feedback-title">Trạng thái đơn hàng / reservation</h2>
          <p role="status" aria-live="polite">{orderMessage}</p>
        </div>
        <span className="demo-tag">MÔ PHỎNG FRONTEND</span>
      </section>

      <footer className="site-footer">
        <span>Deal Mỗi Ngày <span aria-hidden="true">·</span> Giao diện mô phỏng cho Homework 3</span>
        <span>Inventory chỉ đồng bộ trong phiên JavaScript này</span>
      </footer>
    </main>
  )
}
