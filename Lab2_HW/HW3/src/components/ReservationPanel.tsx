import type { Reservation } from '../domain/flashSale.types'

export interface ReservationPanelProps {
  reservations: Reservation[]
  onCheckout: (reservationId: string, paymentStatus: 'approved' | 'declined') => void
  onCancel: (reservationId: string) => void
}

export function ReservationPanel({
  reservations,
  onCheckout,
  onCancel,
}: ReservationPanelProps) {
  if (reservations.length === 0) return null

  return (
    <section className="reservation-panel" aria-label="Reservation đang giữ">
      <h4>Đang giữ hàng</h4>
      <ul>
        {reservations.map((reservation) => (
          <li className="reservation-panel__item" key={reservation.id}>
            <div className="reservation-panel__details">
              <span className="reservation-panel__quantity">{reservation.quantity} sản phẩm</span>
              <span className="reservation-panel__expiry">
                Hết hạn lúc {reservation.expiresAt === null
                  ? '—'
                  : new Date(reservation.expiresAt).toLocaleTimeString('vi-VN')}
              </span>
              <code>{reservation.id}</code>
            </div>
            <div className="reservation-panel__actions" aria-label={`Thao tác reservation ${reservation.id}`}>
              <button
                type="button"
                aria-label={`Checkout reservation ${reservation.id}`}
                onClick={() => onCheckout(reservation.id, 'approved')}
              >
                Checkout
              </button>
              <button
                type="button"
                aria-label={`Từ chối thanh toán reservation ${reservation.id}`}
                onClick={() => onCheckout(reservation.id, 'declined')}
              >
                Từ chối thanh toán
              </button>
              <button
                type="button"
                aria-label={`Hủy giữ hàng reservation ${reservation.id}`}
                onClick={() => onCancel(reservation.id)}
              >
                Hủy giữ hàng
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
