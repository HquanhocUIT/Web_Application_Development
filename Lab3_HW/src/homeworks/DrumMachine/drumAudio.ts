import type { DrumPadDefinition } from './drumPads'

type ActiveVoice = {
  source: AudioScheduledSourceNode
  nodes: AudioNode[]
}

/** Lazily creates one Web Audio context and releases every voice on disposal. */
export class DrumAudioEngine {
  private context: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private readonly activeVoices = new Set<ActiveVoice>()

  play(pad: DrumPadDefinition): void {
    const context = this.getContext()
    if (!context) return

    if (context.state === 'suspended') {
      void context.resume().catch(() => undefined)
    }

    switch (pad.key) {
      case 'W': this.playKick(context); break
      case 'A': this.playSnare(context); break
      case 'S': this.playNoise(context, 0.08, 7200, 0.22); break
      case 'D': this.playNoise(context, 0.38, 5600, 0.24); break
      case 'J': this.playTom(context); break
      case 'K': this.playNoise(context, 0.2, 1500, 0.32); break
      case 'L': this.playNoise(context, 0.72, 3800, 0.34); break
    }
  }

  dispose(): void {
    for (const voice of [...this.activeVoices]) {
      this.releaseVoice(voice, true)
    }

    const context = this.context
    this.context = null
    this.analyser?.disconnect()
    this.analyser = null
    if (context && context.state !== 'closed') {
      void context.close().catch(() => undefined)
    }
  }

  getDecibels(): number {
    if (!this.analyser) return -60

    const samples = new Float32Array(this.analyser.fftSize)
    this.analyser.getFloatTimeDomainData(samples)
    let sumOfSquares = 0
    for (const sample of samples) sumOfSquares += sample * sample
    const rms = Math.sqrt(sumOfSquares / samples.length)
    if (rms === 0) return -60
    return Math.max(-60, Math.min(0, 20 * Math.log10(rms)))
  }

  private getContext(): AudioContext | null {
    if (this.context) return this.context
    if (typeof AudioContext === 'undefined') return null

    this.context = new AudioContext()
    this.analyser = this.context.createAnalyser()
    this.analyser.fftSize = 1024
    this.analyser.connect(this.context.destination)
    return this.context
  }

  private getOutput(context: AudioContext): AnalyserNode {
    if (!this.analyser) {
      this.analyser = context.createAnalyser()
      this.analyser.fftSize = 1024
      this.analyser.connect(context.destination)
    }
    return this.analyser
  }

  private playKick(context: AudioContext): void {
    const now = context.currentTime
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(145, now)
    oscillator.frequency.exponentialRampToValueAtTime(44, now + 0.2)
    envelope.gain.setValueAtTime(0.9, now)
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    oscillator.connect(envelope).connect(this.getOutput(context))
    this.startVoice(oscillator, [envelope], now, 0.23)
  }

  private playSnare(context: AudioContext): void {
    this.playNoise(context, 0.2, 1300, 0.42)

    const now = context.currentTime
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(185, now)
    envelope.gain.setValueAtTime(0.36, now)
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.13)
    oscillator.connect(envelope).connect(this.getOutput(context))
    this.startVoice(oscillator, [envelope], now, 0.14)
  }

  private playTom(context: AudioContext): void {
    const now = context.currentTime
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(205, now)
    oscillator.frequency.exponentialRampToValueAtTime(82, now + 0.29)
    envelope.gain.setValueAtTime(0.56, now)
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    oscillator.connect(envelope).connect(this.getOutput(context))
    this.startVoice(oscillator, [envelope], now, 0.31)
  }

  private playNoise(context: AudioContext, duration: number, cutoff: number, volume: number): void {
    const now = context.currentTime
    const frameCount = Math.ceil(context.sampleRate * duration)
    const buffer = context.createBuffer(1, frameCount, context.sampleRate)
    const samples = buffer.getChannelData(0)

    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const envelope = context.createGain()
    source.buffer = buffer
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(cutoff, now)
    envelope.gain.setValueAtTime(volume, now)
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration)
    source.connect(filter).connect(envelope).connect(this.getOutput(context))
    this.startVoice(source, [filter, envelope], now, duration)
  }

  private startVoice(
    source: AudioScheduledSourceNode,
    nodes: AudioNode[],
    startAt: number,
    duration: number,
  ): void {
    const voice = { source, nodes }
    this.activeVoices.add(voice)
    source.onended = () => this.releaseVoice(voice, false)
    source.start(startAt)
    source.stop(startAt + duration)
  }

  private releaseVoice(voice: ActiveVoice, stop: boolean): void {
    if (!this.activeVoices.delete(voice)) return

    voice.source.onended = null
    if (stop) {
      try {
        voice.source.stop()
      } catch {
        // The source may have ended just before cleanup ran.
      }
    }
    voice.source.disconnect()
    for (const node of voice.nodes) node.disconnect()
  }
}
