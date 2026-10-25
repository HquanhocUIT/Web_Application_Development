export const VISUALIZER_BACKGROUND = '#101827'
export const VISUALIZER_BAR_COLOR = '#38d6c3'

export interface AnimationFrameIdRef {
  current: number | null
}

/** Draws one frame with one bar for each frequency bin from the analyser. */
export function drawFrequencyFrame(
  context: CanvasRenderingContext2D,
  analyser: Pick<AnalyserNode, 'frequencyBinCount' | 'getByteFrequencyData'>,
  width: number,
  height: number,
  frequencyData: Uint8Array<ArrayBuffer> = new Uint8Array(
    analyser.frequencyBinCount,
  ),
): void {
  context.clearRect(0, 0, width, height)
  context.fillStyle = VISUALIZER_BACKGROUND
  context.fillRect(0, 0, width, height)

  analyser.getByteFrequencyData(frequencyData)

  if (frequencyData.length === 0 || width <= 0 || height <= 0) {
    return
  }

  const slotWidth = width / frequencyData.length
  const barGap = Math.min(2, slotWidth * 0.2)
  const barWidth = Math.max(1, slotWidth - barGap)

  context.fillStyle = VISUALIZER_BAR_COLOR

  for (let index = 0; index < frequencyData.length; index += 1) {
    const amplitude = frequencyData[index] ?? 0
    const barHeight = (amplitude / 255) * height
    const x = index * slotWidth
    const y = height - barHeight

    context.fillRect(x, y, barWidth, barHeight)
  }
}

/** Runs one canvas draw per browser animation frame and cancels on cleanup. */
export function startVisualizerAnimationLoop(
  drawFrame: () => void,
  frameIdRef: AnimationFrameIdRef,
  requestFrame: typeof requestAnimationFrame = requestAnimationFrame,
  cancelFrame: typeof cancelAnimationFrame = cancelAnimationFrame,
): () => void {
  let isRunning = true

  const drawNextFrame = () => {
    if (!isRunning) {
      return
    }

    drawFrame()

    if (isRunning) {
      frameIdRef.current = requestFrame(drawNextFrame)
    }
  }

  frameIdRef.current = requestFrame(drawNextFrame)

  return () => {
    isRunning = false

    if (frameIdRef.current !== null) {
      cancelFrame(frameIdRef.current)
      frameIdRef.current = null
    }
  }
}
