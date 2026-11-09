import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PianoKey from './PianoKey'
import { PianoAudioEngine } from './PianoAudioEngine'
import PianoRecordingControls from './PianoRecordingControls'
import { usePianoRecording } from './usePianoRecording'
import styles from './Piano.module.css'

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10])

function midiToLabel(midi: number): string {
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`
}

export type PianoNote = {
  midi: number
  label: string
  isBlack: boolean
  whitePosition: number
}

export function generatePianoNotes(): PianoNote[] {
  let whitePosition = 0
  return Array.from({ length: 88 }, (_, index) => {
    const midi = index + 21
    const pitchClass = midi % 12
    const isBlack = BLACK_PITCH_CLASSES.has(pitchClass)
    if (!isBlack) whitePosition += 1
    return {
      midi,
      label: midiToLabel(midi),
      isBlack,
      whitePosition,
    }
  })
}

const PIANO_NOTES = generatePianoNotes()

function PianoInstrument({ engine }: { engine: PianoAudioEngine }) {
  const recording = usePianoRecording(engine)
  const keyElements = useMemo(() => PIANO_NOTES.map((note) => (
    <PianoKey
      key={note.midi}
      midi={note.midi}
      label={note.label}
      engine={engine}
      onNoteStart={recording.onNoteStart}
      onNoteEnd={recording.onNoteEnd}
      className={note.isBlack ? styles.blackKey : styles.whiteKey}
      style={{ gridColumn: String(note.whitePosition), gridRow: '1' }}
    />
  )), [engine, recording.onNoteEnd, recording.onNoteStart])

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Homework 2 · Polyphonic instrument</p>
          <h1>88-Key Piano</h1>
          <p className={styles.description}>Play a key with pointer, touch, or keyboard focus. Audio starts after your first interaction.</p>
        </div>
        <Link className={styles.homeLink} to="/">All homeworks</Link>
      </header>

      <section className={styles.instrument} aria-label="Piano instrument">
        <h2>Keyboard</h2>
        <p className={styles.hint}>A0 to C8 · up to eight simultaneous notes</p>
        <div className={styles.keyboardViewport}>
          <div className={styles.keyboard} role="group" aria-label="88 piano keys from A0 to C8">
            {keyElements}
          </div>
        </div>
      </section>

      <PianoRecordingControls controller={recording} />
      {recording.notes.length > 0 && (
        <section className={styles.recordedNotes} aria-label="Recorded piano notes">
          <h2>Recording</h2>
          <p>{recording.notes.length} notes · {recording.notes.map((note) => midiToLabel(note.midi)).join(', ')}</p>
        </section>
      )}
    </main>
  )
}

export default function Piano() {
  const [engine, setEngine] = useState<PianoAudioEngine | null>(null)

  useEffect(() => {
    const audioEngine = new PianoAudioEngine()
    setEngine(audioEngine)
    return () => audioEngine.dispose()
  }, [])

  if (!engine) {
    return <main className={styles.page} aria-busy="true">Preparing piano…</main>
  }

  return <PianoInstrument engine={engine} />
}
