import type { PianoAudioEngine, PianoVoiceHandle } from './PianoAudioEngine'
import type { RecordedPianoNote } from './PianoRecorder'

export const PLAYBACK_SPEEDS = [0.5, 1, 2] as const
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number]

type PlaybackEvent = {
  at: number
  kind: 'start' | 'release'
  note: RecordedPianoNote
}

export function calculatePlaybackOffset(offsetMs: number, speed: PlaybackSpeed): number {
  return offsetMs / speed
}

/** Replays a recording in time order and aborts pending waits when stopped. */
export class PianoSequencePlayer {
  private readonly engine: Pick<PianoAudioEngine, 'prepareAudio' | 'startVoice' | 'releaseVoiceHandle'>
  private readonly now: () => number
  private controller: AbortController | null = null
  private readonly playbackVoices = new Map<RecordedPianoNote, PianoVoiceHandle>()

  constructor(
    engine: Pick<PianoAudioEngine, 'prepareAudio' | 'startVoice' | 'releaseVoiceHandle'>,
    now: () => number = () => performance.now(),
  ) {
    this.engine = engine
    this.now = now
  }

  play(notes: readonly RecordedPianoNote[], speed: PlaybackSpeed): Promise<void> {
    if (!PLAYBACK_SPEEDS.includes(speed)) return Promise.reject(new RangeError('Unsupported playback speed.'))
    this.stop()
    if (notes.length === 0) return Promise.resolve()

    const controller = new AbortController()
    this.controller = controller

    // Call prepareAudio synchronously in the Play button's user-gesture handler.
    const audioReady = this.engine.prepareAudio()
    return this.runPlayback(notes, speed, controller, audioReady)
  }

  stop(): void {
    this.controller?.abort()
    this.controller = null
    this.releasePlaybackVoices()
  }

  private async runPlayback(
    notes: readonly RecordedPianoNote[],
    speed: PlaybackSpeed,
    controller: AbortController,
    audioReady: Promise<boolean>,
  ): Promise<void> {
    const { signal } = controller
    try {
      if (!await audioReady || signal.aborted) return

      const events = createPlaybackEvents(notes, speed)
      const playbackStartedAt = this.now()
      for (const event of events) {
        const targetTime = playbackStartedAt + event.at
        await waitUntil(targetTime, this.now, signal)
        if (signal.aborted) return

        if (event.kind === 'start') {
          const voice = this.engine.startVoice(event.note.midi)
          if (voice) this.playbackVoices.set(event.note, voice)
        } else {
          const voice = this.playbackVoices.get(event.note)
          if (voice) {
            this.engine.releaseVoiceHandle(voice)
            this.playbackVoices.delete(event.note)
          }
        }
      }
    } finally {
      if (this.controller === controller) this.controller = null
    }
  }

  private releasePlaybackVoices(): void {
    for (const voice of this.playbackVoices.values()) this.engine.releaseVoiceHandle(voice)
    this.playbackVoices.clear()
  }
}

function createPlaybackEvents(notes: readonly RecordedPianoNote[], speed: PlaybackSpeed): PlaybackEvent[] {
  const events: PlaybackEvent[] = []
  for (const note of notes) {
    const startOffset = Math.max(0, note.startOffset)
    const duration = Math.max(1, note.duration)
    events.push({ at: calculatePlaybackOffset(startOffset, speed), kind: 'start', note })
    events.push({
      at: calculatePlaybackOffset(startOffset + duration, speed),
      kind: 'release',
      note,
    })
  }

  return events.sort((left, right) => {
    if (left.at !== right.at) return left.at - right.at
    if (left.kind !== right.kind) return left.kind === 'release' ? -1 : 1
    return left.note.id - right.note.id
  })
}

function waitUntil(targetTime: number, now: () => number, signal: AbortSignal): Promise<void> {
  const remaining = Math.max(0, targetTime - now())
  if (remaining === 0 || signal.aborted) return Promise.resolve()

  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout>
    const finish = () => {
      clearTimeout(timeoutId)
      signal.removeEventListener('abort', finish)
      resolve()
    }
    timeoutId = setTimeout(finish, remaining)
    signal.addEventListener('abort', finish, { once: true })
  })
}
