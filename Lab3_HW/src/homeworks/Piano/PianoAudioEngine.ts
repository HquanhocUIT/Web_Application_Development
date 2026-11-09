export const MAX_PIANO_VOICES = 8
export const NOTE_RELEASE_SECONDS = 0.08
const NOTE_PEAK_GAIN = 0.22
const NOTE_ATTACK_SECONDS = 0.008

export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

export type PianoVoiceHandle = {
  readonly midi: number
  readonly token: symbol
}

type PianoVoice = {
  midi: number
  oscillator: OscillatorNode
  gain: GainNode
  handle: PianoVoiceHandle
  started: boolean
  releasing: boolean
  startedAt: number | null
}

/** Creates audio lazily on the first user-triggered note. */
export class PianoAudioEngine {
  private context: AudioContext | null = null
  private readonly activeVoices = new Map<number, PianoVoice>()
  private readonly voicesAwaitingCleanup = new Set<PianoVoice>()
  private disposed = false

  startNote(midi: number): boolean {
    return this.startVoice(midi) !== null
  }

  prepareAudio(): Promise<boolean> {
    const context = this.getOrCreateContext()
    if (!context) return Promise.resolve(false)
    if (context.state === 'running') return Promise.resolve(true)
    return context.resume().then(() => context.state === 'running').catch(() => false)
  }

  startVoice(midi: number): PianoVoiceHandle | null {
    if (this.disposed || !Number.isInteger(midi) || midi < 0 || midi > 127) return null
    if (this.activeVoices.has(midi)) return null

    const context = this.getOrCreateContext()
    if (!context) return null

    if (this.activeVoices.size >= MAX_PIANO_VOICES) {
      const oldestMidi = this.activeVoices.keys().next().value
      if (oldestMidi !== undefined) this.releaseNote(oldestMidi)
    }

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const voice: PianoVoice = {
      midi,
      oscillator,
      gain,
      handle: { midi, token: Symbol(`piano-voice-${midi}`) },
      started: false,
      releasing: false,
      startedAt: null,
    }
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(midiToFrequency(midi), context.currentTime)
    gain.gain.setValueAtTime(0, context.currentTime)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.onended = () => this.cleanupVoice(voice)
    this.activeVoices.set(midi, voice)
    this.voicesAwaitingCleanup.add(voice)

    if (context.state === 'running') {
      this.beginVoice(voice, context)
    } else {
      void context.resume().then(() => {
        if (context.state === 'running') this.beginVoice(voice, context)
      }).catch(() => this.cleanupVoice(voice))
    }

    return voice.handle
  }

  releaseNote(midi: number): boolean {
    const voice = this.activeVoices.get(midi)
    if (!voice) return false

    return this.releaseVoiceHandle(voice.handle)
  }

  releaseVoiceHandle(handle: PianoVoiceHandle): boolean {
    const voice = this.activeVoices.get(handle.midi)
    if (!voice || voice.handle !== handle) return false

    this.activeVoices.delete(handle.midi)
    if (!voice.started) {
      this.cleanupVoice(voice)
      return true
    }

    this.releaseVoice(voice)
    return true
  }

  getActiveNotes(): number[] {
    return [...this.activeVoices.keys()]
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.activeVoices.clear()

    for (const voice of this.voicesAwaitingCleanup) {
      try {
        if (voice.started) voice.oscillator.stop()
      } catch {
        // A voice may already have stopped while its end event is being delivered.
      }
      this.cleanupVoice(voice)
    }

    const context = this.context
    this.context = null
    if (context && context.state !== 'closed') void context.close().catch(() => undefined)
  }

  private getOrCreateContext(): AudioContext | null {
    if (this.context) return this.context
    if (typeof AudioContext === 'undefined') return null

    try {
      this.context = new AudioContext()
      return this.context
    } catch {
      return null
    }
  }

  private beginVoice(voice: PianoVoice, context: AudioContext): void {
    if (this.disposed || this.activeVoices.get(voice.midi) !== voice || voice.started) return

    const startAt = context.currentTime
    voice.gain.gain.cancelScheduledValues(startAt)
    voice.gain.gain.setValueAtTime(0, startAt)
    voice.gain.gain.linearRampToValueAtTime(NOTE_PEAK_GAIN, startAt + NOTE_ATTACK_SECONDS)
    voice.started = true
    voice.startedAt = startAt
    try {
      voice.oscillator.start(startAt)
    } catch {
      this.activeVoices.delete(voice.midi)
      this.cleanupVoice(voice)
    }
  }

  private releaseVoice(voice: PianoVoice): void {
    if (voice.releasing) return
    voice.releasing = true
    const context = this.context
    if (!context || context.state === 'closed') {
      this.cleanupVoice(voice)
      return
    }

    const releaseAt = context.currentTime
    const releaseEnd = releaseAt + NOTE_RELEASE_SECONDS
    if (typeof voice.gain.gain.cancelAndHoldAtTime === 'function') {
      voice.gain.gain.cancelAndHoldAtTime(releaseAt)
    } else {
      voice.gain.gain.cancelScheduledValues(releaseAt)
      const elapsed = Math.max(0, releaseAt - (voice.startedAt ?? releaseAt))
      const attackProgress = Math.min(1, elapsed / NOTE_ATTACK_SECONDS)
      voice.gain.gain.setValueAtTime(NOTE_PEAK_GAIN * attackProgress, releaseAt)
    }
    voice.gain.gain.linearRampToValueAtTime(0, releaseEnd)
    try {
      voice.oscillator.stop(releaseEnd)
    } catch {
      this.cleanupVoice(voice)
    }
  }

  private cleanupVoice(voice: PianoVoice): void {
    if (!this.voicesAwaitingCleanup.delete(voice)) return
    if (this.activeVoices.get(voice.midi) === voice) this.activeVoices.delete(voice.midi)
    voice.oscillator.onended = null
    voice.oscillator.disconnect()
    voice.gain.disconnect()
  }
}
