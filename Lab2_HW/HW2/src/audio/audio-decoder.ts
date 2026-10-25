import type { AudioTaskProcessor } from '../types/audio-task'
import { AudioTaskQueue } from './audio-task-queue'

export interface AudioDecoderOptions {
  fetchAudio?: typeof fetch
  createAudioContext?: () => AudioContext
}

export interface AudioTaskQueueController {
  readonly queue: AudioTaskQueue<AudioBuffer>
  cleanup(): Promise<void>
}

export type AudioFftSize = 256 | 512

export interface AudioPlaybackPipeline {
  readonly analyser: AnalyserNode
  start(): Promise<void>
  stop(): void
  setOnEnded(callback: () => void): void
}

/** Downloads and decodes audio while reusing one lazily-created AudioContext. */
export class AudioDecoder {
  private readonly options: AudioDecoderOptions
  private readonly playbackPipelines = new Set<AudioPlaybackPipeline>()
  private audioContext: AudioContext | null = null
  private cleanupPromise: Promise<void> | null = null
  private isClosed = false

  constructor(options: AudioDecoderOptions = {}) {
    this.options = options
  }

  readonly processTask: AudioTaskProcessor<AudioBuffer> = async (
    audioUrl,
    signal,
  ) => {
    if (this.isClosed) {
      throw new Error('The audio decoder has been cleaned up.')
    }

    throwIfAborted(signal)
    const resolvedUrl = resolveAudioUrl(audioUrl)
    const audioData = await this.downloadAudio(resolvedUrl, signal)
    throwIfAborted(signal)

    const audioContext = this.getAudioContext()
    let audioBuffer: AudioBuffer

    try {
      audioBuffer = await audioContext.decodeAudioData(audioData)
    } catch (error) {
      if (signal.aborted) {
        throw createAbortError()
      }

      throw new Error('The downloaded file could not be decoded as audio.', {
        cause: error,
      })
    }

    // decodeAudioData cannot be cancelled; discard its result if abort arrived
    // after decoding started.
    throwIfAborted(signal)
    return audioBuffer
  }

  /** Connects a decoded buffer to an analyser and the audio output. */
  createPlaybackPipeline(
    audioBuffer: AudioBuffer,
    fftSize: AudioFftSize = 256,
  ): AudioPlaybackPipeline {
    if (this.isClosed) {
      throw new Error('The audio decoder has been cleaned up.')
    }

    if (fftSize !== 256 && fftSize !== 512) {
      throw new RangeError('Audio FFT size must be 256 or 512.')
    }

    const audioContext = this.getAudioContext()
    const source = audioContext.createBufferSource()
    const analyser = audioContext.createAnalyser()

    try {
      source.buffer = audioBuffer
      analyser.fftSize = fftSize
      source.connect(analyser)
      analyser.connect(audioContext.destination)
    } catch (error) {
      releasePlaybackNodes(source, analyser)
      throw error
    }

    let started = false
    let stopped = false
    let startPromise: Promise<void> | null = null
    let onEnded: (() => void) | null = null
    let pipeline: AudioPlaybackPipeline | null = null

    const releaseNodes = () => {
      try {
        releasePlaybackNodes(source, analyser)
      } finally {
        if (pipeline) {
          this.playbackPipelines.delete(pipeline)
        }
      }
    }

    source.onended = () => {
      if (stopped) {
        return
      }

      stopped = true
      const endedCallback = onEnded
      onEnded = null
      releaseNodes()
      endedCallback?.()
    }

    pipeline = {
      analyser,
      setOnEnded(callback) {
        onEnded = callback
      },
      start() {
        if (stopped) {
          return Promise.reject(new Error('This audio pipeline has been stopped.'))
        }

        if (startPromise) {
          return startPromise
        }

        startPromise = (async () => {
          if (audioContext.state === 'suspended') {
            await audioContext.resume()
          }

          if (stopped) {
            throw new Error('This audio pipeline was stopped before it could start.')
          }

          source.start()
          started = true
        })()

        return startPromise
      },
      stop() {
        if (stopped) {
          return
        }

        stopped = true
        onEnded = null
        source.onended = null

        try {
          if (started) {
            source.stop()
          }
        } catch (error) {
          if (!isInvalidStateError(error)) {
            throw error
          }
        } finally {
          releaseNodes()
        }
      },
    }

    this.playbackPipelines.add(pipeline)
    return pipeline
  }

  /** Closes the shared context. Queue owners should stop the queue first. */
  cleanup(): Promise<void> {
    if (this.cleanupPromise) {
      return this.cleanupPromise
    }

    this.isClosed = true
    for (const pipeline of [...this.playbackPipelines]) {
      try {
        pipeline.stop()
      } catch (error) {
        console.error('Could not stop an audio pipeline during cleanup.', error)
      }
    }
    this.playbackPipelines.clear()

    const audioContext = this.audioContext
    this.audioContext = null

    this.cleanupPromise = audioContext && audioContext.state !== 'closed'
      ? audioContext.close()
      : Promise.resolve()

    return this.cleanupPromise
  }

  private async downloadAudio(
    resolvedUrl: string,
    signal: AbortSignal,
  ): Promise<ArrayBuffer> {
    const fetchAudio = this.options.fetchAudio ?? globalThis.fetch
    let response: Response

    try {
      response = await fetchAudio(resolvedUrl, { signal })
    } catch (error) {
      throwDownloadError(error, signal)
    }

    if (!response.ok) {
      throw new Error(`Audio request failed with HTTP ${response.status}.`)
    }

    try {
      return await response.arrayBuffer()
    } catch (error) {
      throwDownloadError(error, signal)
    }
  }

  private getAudioContext(): AudioContext {
    if (this.audioContext) {
      return this.audioContext
    }

    if (this.options.createAudioContext) {
      this.audioContext = this.options.createAudioContext()
      return this.audioContext
    }

    if (typeof globalThis.AudioContext === 'undefined') {
      throw new Error('The Web Audio API is not available in this browser.')
    }

    this.audioContext = new globalThis.AudioContext()
    return this.audioContext
  }
}

/** Connects the decoder processor to the FIFO queue and owns both lifecycles. */
export function createAudioTaskQueue(
  options: AudioDecoderOptions = {},
): AudioTaskQueueController {
  const decoder = new AudioDecoder(options)
  const queue = new AudioTaskQueue<AudioBuffer>({
    processTask: decoder.processTask,
  })
  let cleanupPromise: Promise<void> | null = null

  return {
    queue,
    cleanup() {
      if (!cleanupPromise) {
        cleanupPromise = (async () => {
          await queue.cleanup()
          await decoder.cleanup()
        })()
      }

      return cleanupPromise
    },
  }
}

function resolveAudioUrl(audioUrl: string): string {
  const trimmedUrl = audioUrl.trim()

  if (!trimmedUrl) {
    throw new Error('Audio URL cannot be empty.')
  }

  try {
    const baseUrl = typeof globalThis.location === 'undefined'
      ? undefined
      : globalThis.location.href
    const parsedUrl = new URL(trimmedUrl, baseUrl)
    const supportedProtocols = ['http:', 'https:', 'blob:', 'data:']

    if (!supportedProtocols.includes(parsedUrl.protocol)) {
      throw new Error('Unsupported URL protocol.')
    }

    return parsedUrl.href
  } catch {
    throw new Error('Audio URL must be a valid HTTP, HTTPS, blob, or data URL.')
  }
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw createAbortError()
  }
}

function throwDownloadError(error: unknown, signal: AbortSignal): never {
  if (signal.aborted || isAbortError(error)) {
    throw createAbortError()
  }

  throw new Error('Could not download the audio file.', { cause: error })
}

function createAbortError(): DOMException {
  return new DOMException('The audio task was cancelled.', 'AbortError')
}

function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'name' in error
    && error.name === 'AbortError'
}

function isInvalidStateError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'name' in error
    && error.name === 'InvalidStateError'
}

function releasePlaybackNodes(
  source: AudioBufferSourceNode,
  analyser: AnalyserNode,
): void {
  source.onended = null
  source.disconnect()
  analyser.disconnect()
  source.buffer = null
}
