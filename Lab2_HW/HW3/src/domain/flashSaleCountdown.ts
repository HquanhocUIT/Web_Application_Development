export type FlashSalePhase = 'upcoming' | 'active' | 'ended' | 'invalid'

export interface CountdownTimeParts {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface FlashSaleCountdown {
  phase: FlashSalePhase
  /** Milliseconds until sale end, clamped at zero. */
  remainingUntilEndMs: number
  /** Milliseconds until sale start; null once the sale has started. */
  remainingUntilStartMs: number | null
  /** Parts for the upcoming start countdown or active end countdown. */
  displayTime: CountdownTimeParts
}

export type CountdownDisplay = Pick<FlashSaleCountdown, 'phase' | 'displayTime'>

/** Compare only the values rendered by the countdown, not sub-second changes. */
export function isSameCountdownDisplay(
  first: CountdownDisplay,
  second: CountdownDisplay,
): boolean {
  return first.phase === second.phase &&
    first.displayTime.days === second.displayTime.days &&
    first.displayTime.hours === second.displayTime.hours &&
    first.displayTime.minutes === second.displayTime.minutes &&
    first.displayTime.seconds === second.displayTime.seconds
}

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24

const MILLISECONDS_PER_MINUTE = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * MINUTES_PER_HOUR
const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * HOURS_PER_DAY

function splitDuration(milliseconds: number): CountdownTimeParts {
  const days = Math.floor(milliseconds / MILLISECONDS_PER_DAY)
  const hours = Math.floor(milliseconds / MILLISECONDS_PER_HOUR) % HOURS_PER_DAY
  const minutes = Math.floor(milliseconds / MILLISECONDS_PER_MINUTE) % MINUTES_PER_HOUR
  const seconds = Math.floor(milliseconds / MILLISECONDS_PER_SECOND) % SECONDS_PER_MINUTE

  return { days, hours, minutes, seconds }
}

/**
 * Calculate a countdown from absolute epoch-millisecond timestamps.
 * Pass Date.now() on every call; never derive time by counting callbacks.
 */
export function calculateFlashSaleCountdown(
  saleStartsAt: number,
  saleEndsAt: number,
  nowMs: number,
): FlashSaleCountdown {
  if (
    !Number.isFinite(saleStartsAt) ||
    !Number.isFinite(saleEndsAt) ||
    !Number.isFinite(nowMs) ||
    saleEndsAt <= saleStartsAt
  ) {
    return {
      phase: 'invalid',
      remainingUntilEndMs: 0,
      remainingUntilStartMs: null,
      displayTime: splitDuration(0),
    }
  }

  const remainingUntilEndMs = Math.max(0, saleEndsAt - nowMs)
  if (nowMs < saleStartsAt) {
    const remainingUntilStartMs = saleStartsAt - nowMs
    return {
      phase: 'upcoming',
      remainingUntilEndMs,
      remainingUntilStartMs,
      displayTime: splitDuration(remainingUntilStartMs),
    }
  }

  if (nowMs < saleEndsAt) {
    return {
      phase: 'active',
      remainingUntilEndMs,
      remainingUntilStartMs: null,
      displayTime: splitDuration(remainingUntilEndMs),
    }
  }

  return {
    phase: 'ended',
    remainingUntilEndMs: 0,
    remainingUntilStartMs: null,
    displayTime: splitDuration(0),
  }
}
