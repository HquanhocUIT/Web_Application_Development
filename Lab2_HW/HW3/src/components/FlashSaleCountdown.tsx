import { useEffect, useRef, useState } from 'react'
import {
  calculateFlashSaleCountdown,
  isSameCountdownDisplay,
  type CountdownDisplay,
} from '../domain/flashSaleCountdown'
import { startCountdownAnimationLoop } from '../domain/countdownAnimationLoop'
import './FlashSaleCountdown.css'

export interface FlashSaleCountdownProps {
  /** Epoch-millisecond timestamp when the sale opens. */
  saleStartsAt: number
  /** Epoch-millisecond timestamp when the sale closes. */
  saleEndsAt: number
}

function getDisplay(
  phase: CountdownDisplay['phase'],
  displayTime: CountdownDisplay['displayTime'],
): CountdownDisplay {
  return { phase, displayTime }
}

export function FlashSaleCountdown({
  saleStartsAt,
  saleEndsAt,
}: FlashSaleCountdownProps) {
  const [display, setDisplay] = useState<CountdownDisplay>(() => {
    const initial = calculateFlashSaleCountdown(saleStartsAt, saleEndsAt, Date.now())
    return getDisplay(initial.phase, initial.displayTime)
  })
  const displayedRef = useRef(display)
  const stopLoopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const stopLoop = startCountdownAnimationLoop((nowMs) => {
      const current = calculateFlashSaleCountdown(saleStartsAt, saleEndsAt, nowMs)
      const nextDisplay = getDisplay(current.phase, current.displayTime)

      if (!isSameCountdownDisplay(displayedRef.current, nextDisplay)) {
        displayedRef.current = nextDisplay
        setDisplay(nextDisplay)
      }

      return current.phase === 'upcoming' || current.phase === 'active'
    })

    stopLoopRef.current = stopLoop
    return () => {
      stopLoop()
      if (stopLoopRef.current === stopLoop) stopLoopRef.current = null
    }
  }, [saleStartsAt, saleEndsAt])

  const statusText = {
    upcoming: 'Flash Sale bắt đầu sau',
    active: 'Flash Sale kết thúc sau',
    ended: 'Flash Sale đã kết thúc',
    invalid: 'Không thể hiển thị countdown: thời gian Flash Sale không hợp lệ.',
  }[display.phase]

  return (
    <section className="flash-sale-countdown" aria-label="Đếm ngược Flash Sale">
      <p className="flash-sale-countdown__status">{statusText}</p>
      {display.phase !== 'invalid' && (
        <dl className="flash-sale-countdown__time" aria-label="Thời gian còn lại">
          <div className="flash-sale-countdown__unit">
            <dt>Ngày</dt>
            <dd>{display.displayTime.days}</dd>
          </div>
          <div className="flash-sale-countdown__unit">
            <dt>Giờ</dt>
            <dd>{String(display.displayTime.hours).padStart(2, '0')}</dd>
          </div>
          <div className="flash-sale-countdown__unit">
            <dt>Phút</dt>
            <dd>{String(display.displayTime.minutes).padStart(2, '0')}</dd>
          </div>
          <div className="flash-sale-countdown__unit">
            <dt>Giây</dt>
            <dd>{String(display.displayTime.seconds).padStart(2, '0')}</dd>
          </div>
        </dl>
      )}
    </section>
  )
}
