export interface AnimationFrameScheduler {
  request: (callback: FrameRequestCallback) => number
  cancel: (frameId: number) => void
  now: () => number
}

/** Start one self-scheduling animation loop and return its cleanup function. */
export function startCountdownAnimationLoop(
  onFrame: (nowMs: number) => boolean,
  scheduler: AnimationFrameScheduler = {
    request: (callback) => requestAnimationFrame(callback),
    cancel: (frameId) => cancelAnimationFrame(frameId),
    now: () => Date.now(),
  },
): () => void {
  let active = true
  let frameId: number | null = null

  const tick: FrameRequestCallback = () => {
    frameId = null
    if (!active) return

    const shouldContinue = onFrame(scheduler.now())
    if (active && shouldContinue) frameId = scheduler.request(tick)
  }

  tick(0)

  return () => {
    active = false
    if (frameId !== null) scheduler.cancel(frameId)
    frameId = null
  }
}
