import { midiToFrequency } from './PianoAudioEngine'

export type RecordedPianoNote = Readonly<{
  id: number
  midi: number
  frequency: number
  startOffset: number
  duration: number
}>

type MutableRecordedNote = {
  id: number
  midi: number
  frequency: number
  startOffset: number
  duration: number
  startedAt: number
}

export class PianoRecorder {
  private readonly now: () => number
  private origin: number | null = null
  private nextId = 0
  private notes: MutableRecordedNote[] = []
  private readonly pending = new Map<number, MutableRecordedNote>()

  constructor(now: () => number = () => performance.now()) {
    this.now = now
  }

  get isRecording(): boolean {
    return this.origin !== null
  }

  start(): void {
    this.notes = []
    this.pending.clear()
    this.nextId = 0
    this.origin = this.now()
  }

  noteOn(midi: number): boolean {
    if (this.origin === null || this.pending.has(midi)) return false
    const startedAt = this.now()
    const note: MutableRecordedNote = {
      id: this.nextId++,
      midi,
      frequency: midiToFrequency(midi),
      startOffset: Math.max(0, startedAt - this.origin),
      duration: 0,
      startedAt,
    }
    this.notes.push(note)
    this.pending.set(midi, note)
    return true
  }

  noteOff(midi: number): boolean {
    if (this.origin === null) return false
    const note = this.pending.get(midi)
    if (!note) return false
    this.finishNote(note, this.now())
    return true
  }

  stop(): RecordedPianoNote[] {
    if (this.origin !== null) {
      const stoppedAt = this.now()
      for (const note of this.pending.values()) this.finishNote(note, stoppedAt)
      this.pending.clear()
      this.origin = null
    }
    return this.getNotes()
  }

  getNotes(): RecordedPianoNote[] {
    return this.notes.map(({ id, midi, frequency, startOffset, duration }) => ({
      id,
      midi,
      frequency,
      startOffset,
      duration,
    }))
  }

  private finishNote(note: MutableRecordedNote, endedAt: number): void {
    note.duration = Math.max(0, endedAt - note.startedAt)
    this.pending.delete(note.midi)
  }
}
