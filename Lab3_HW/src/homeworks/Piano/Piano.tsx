import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PianoAudioEngine } from './PianoAudioEngine'
import PianoKeyboard from './PianoKeyboard'
import PianoRecordingControls from './PianoRecordingControls'
import { usePianoRecording } from './usePianoRecording'
import type { RecordedPianoNote } from './PianoRecorder'
import styles from './Piano.module.css'

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

function midiToLabel(midi: number): string {
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`
}

function PianoInstrument({ engine }: { engine: PianoAudioEngine }) {
  const recording = usePianoRecording(engine)
  const status = recording.isRecording
    ? 'Recording'
    : recording.isPlaying
      ? 'Playing back'
      : recording.notes.length > 0
        ? 'Take saved'
        : 'Ready'
  const latestNoteTime = useMemo(
    () => Math.max(1, ...recording.notes.map((note) => note.startOffset + note.duration)),
    [recording.notes],
  )

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandLine}>
          <span className={styles.brandMark} aria-hidden="true">D</span>
          <span>Digital instruments <span aria-hidden="true">/</span> Lab 03</span>
        </div>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.eyebrow}>Homework 2 · Polyphonic instrument</p>
            <h1>Digital Piano <span>Studio</span></h1>
            <p className={styles.description}>An expressive 88-key instrument with a concurrent recording sequencer.</p>
          </div>
          <div className={`${styles.status} ${recording.isRecording ? styles.statusRecording : ''}`} role="status" aria-live="polite">
            <span className={styles.statusDot} aria-hidden="true" />
            {status}
          </div>
        </div>
      </header>

      <PianoKeyboard
        engine={engine}
        onNoteStart={recording.onNoteStart}
        onNoteEnd={recording.onNoteEnd}
      />

      <div className={styles.workspace}>
        <PianoRecordingControls controller={recording} />
        <section className={styles.recordingPanel} aria-labelledby="recording-list-title">
          <header className={styles.recordingHeader}>
            <div>
              <p className={styles.eyebrow}>Session</p>
              <h2 id="recording-list-title">Recorded notes</h2>
            </div>
            <span className={styles.noteCount}>{recording.notes.length} <span>notes</span></span>
          </header>
          {recording.notes.length === 0 ? (
            <p className={styles.emptyRecording}>Start a recording, then play a few notes to build a take.</p>
          ) : (
            <ol className={styles.noteTimeline} aria-label="Recorded note timeline">
              {recording.notes.map((note) => (
                <RecordedNoteRow key={note.id} note={note} totalDuration={latestNoteTime} />
              ))}
            </ol>
          )}
        </section>
      </div>

      <footer className={styles.footer}>
        <span>Scroll the keyboard to explore A0–C8</span>
        <Link to="/">All homeworks</Link>
      </footer>
    </main>
  )
}

function RecordedNoteRow({ note, totalDuration }: { note: RecordedPianoNote; totalDuration: number }) {
  const left = Math.min(100, Math.max(0, (note.startOffset / totalDuration) * 100))
  const width = Math.min(100 - left, Math.max(1.5, (note.duration / totalDuration) * 100))

  return (
    <li className={styles.timelineRow}>
      <div className={styles.timelineMeta}>
        <strong>{midiToLabel(note.midi)}</strong>
        <span>{(note.startOffset / 1000).toFixed(2)}s · {(note.duration / 1000).toFixed(2)}s</span>
      </div>
      <div className={styles.timelineTrack} aria-hidden="true">
        <span className={styles.timelineNote} style={{ left: `${left}%`, width: `${width}%` }} />
      </div>
    </li>
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
