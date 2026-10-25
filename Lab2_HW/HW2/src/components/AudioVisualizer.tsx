import { useEffect, useRef } from 'react'
import {
  drawFrequencyFrame,
  startVisualizerAnimationLoop,
} from './audio-visualizer-drawing'
import './AudioVisualizer.css'

export interface AudioVisualizerProps {
  analyser: AnalyserNode | null
  height?: number
}

const DEFAULT_HEIGHT = 180

interface CanvasSize {
  width: number
  height: number
  pixelRatio: number
}

/** Draws frequency bars continuously while an analyser is connected. */
export function AudioVisualizer({
  analyser,
  height = DEFAULT_HEIGHT,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameIdRef = useRef<number | null>(null)
  const canvasSizeRef = useRef<CanvasSize>({ width: 0, height: 0, pixelRatio: 0 })
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(0))

  useEffect(() => {
    if (!analyser) {
      canvasSizeRef.current = { width: 0, height: 0, pixelRatio: 0 }
      return
    }

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) {
      return
    }

    canvasSizeRef.current = { width: 0, height: 0, pixelRatio: 0 }

    const drawFrame = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = Math.max(window.devicePixelRatio || 1, 1)

      if (bounds.width <= 0 || bounds.height <= 0) {
        return
      }

      if (frequencyDataRef.current.length !== analyser.frequencyBinCount) {
        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount)
      }

      const previousSize = canvasSizeRef.current
      const sizeChanged =
        previousSize.width !== bounds.width ||
        previousSize.height !== bounds.height ||
        previousSize.pixelRatio !== pixelRatio

      if (sizeChanged) {
        canvas.width = Math.round(bounds.width * pixelRatio)
        canvas.height = Math.round(bounds.height * pixelRatio)
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
        canvasSizeRef.current = {
          width: bounds.width,
          height: bounds.height,
          pixelRatio,
        }
      }

      drawFrequencyFrame(
        context,
        analyser,
        bounds.width,
        bounds.height,
        frequencyDataRef.current,
      )
    }

    return startVisualizerAnimationLoop(drawFrame, animationFrameIdRef)
  }, [analyser, height])

  if (!analyser) {
    return (
      <div className="audio-visualizer audio-visualizer--empty" role="status">
        Load an audio file to view its frequency bars.
      </div>
    )
  }

  return (
    <figure className="audio-visualizer">
      <canvas
        ref={canvasRef}
        className="audio-visualizer__canvas"
        height={height}
        role="img"
        aria-label="Audio frequency bars"
        style={{ height: `${height}px` }}
      />
      <figcaption className="audio-visualizer__caption">
        Frequency levels from the connected audio analyser.
      </figcaption>
    </figure>
  )
}
