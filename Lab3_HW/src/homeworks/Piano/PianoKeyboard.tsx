import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import PianoKey from './PianoKey'
import type { PianoAudioEngine } from './PianoAudioEngine'
import styles from './PianoKeyboard.module.css'

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10])
const WHITE_KEY_COUNT = 52

export type PianoNote = {
  midi: number
  label: string
  visualLabel: string
  isBlack: boolean
  whitePosition: number
}

function midiToLabel(midi: number): string {
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`
}

export function generatePianoNotes(): PianoNote[] {
  let whitePosition = 0
  return Array.from({ length: 88 }, (_, index) => {
    const midi = index + 21
    const pitchClass = midi % 12
    const isBlack = BLACK_PITCH_CLASSES.has(pitchClass)
    if (!isBlack) whitePosition += 1
    const label = midiToLabel(midi)
    return {
      midi,
      label,
      visualLabel: !isBlack && (pitchClass === 0 || midi === 21) ? label : '',
      isBlack,
      whitePosition,
    }
  })
}

export const PIANO_NOTES = generatePianoNotes()

export function calculateCenteredScrollLeft(
  viewportWidth: number,
  keyboardWidth: number,
  whitePosition: number,
): number {
  const whiteKeyWidth = keyboardWidth / WHITE_KEY_COUNT
  return Math.max(0, whitePosition * whiteKeyWidth - whiteKeyWidth / 2 - viewportWidth / 2)
}

type PianoKeyboardProps = {
  engine: PianoAudioEngine
  onNoteStart: (midi: number) => void
  onNoteEnd: (midi: number) => void
}

function PianoKeyboard({ engine, onNoteStart, onNoteEnd }: PianoKeyboardProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const keyboardRef = useRef<HTMLDivElement>(null)
  const keys = useMemo(() => PIANO_NOTES.map((note) => (
    <PianoKey
      key={note.midi}
      midi={note.midi}
      label={note.label}
      visualLabel={note.visualLabel}
      engine={engine}
      onNoteStart={onNoteStart}
      onNoteEnd={onNoteEnd}
      className={`${note.isBlack ? styles.blackKey : styles.whiteKey} ${note.midi === 60 ? styles.middleC : ''}`}
      style={{ gridColumn: String(note.whitePosition), gridRow: '1' }}
    />
  )), [engine, onNoteEnd, onNoteStart])

  const handleKeyboardNavigation = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    const buttons = keyboardRef.current?.querySelectorAll<HTMLButtonElement>('button[data-midi]')
    if (!buttons?.length) return

    const currentMidi = Number((event.target as HTMLElement).getAttribute('data-midi'))
    if (!Number.isInteger(currentMidi)) return
    const nextMidi = event.key === 'Home'
      ? 21
      : event.key === 'End'
        ? 108
        : Math.min(108, Math.max(21, currentMidi + (event.key === 'ArrowRight' ? 1 : -1)))
    event.preventDefault()
    buttons[nextMidi - 21]?.focus()
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    const middleC = PIANO_NOTES.find((note) => note.midi === 60)
    if (!viewport || !middleC) return

    const frame = window.requestAnimationFrame(() => {
      viewport.scrollLeft = calculateCenteredScrollLeft(
        viewport.clientWidth,
        viewport.scrollWidth,
        middleC.whitePosition,
      )
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <section className={styles.panel} aria-labelledby="piano-keyboard-title">
      <header className={styles.panelHeader}>
        <div>
          <p className={styles.kicker}>Instrument</p>
          <h2 id="piano-keyboard-title">88-key piano</h2>
        </div>
        <span className={styles.range}>A0 <span aria-hidden="true">—</span> C8</span>
      </header>

      <div
        className={styles.viewport}
        ref={viewportRef}
        role="region"
        aria-label="Scrollable piano keyboard"
      >
        <div
          className={styles.keyboard}
          ref={keyboardRef}
          role="group"
          aria-label="88 piano keys from A0 to C8"
          onKeyDown={handleKeyboardNavigation}
        >
          {keys}
        </div>
      </div>

      <div className={styles.legend} aria-hidden="true">
        <span>A0</span>
        <span className={styles.middleCLabel}>C4 · Middle C</span>
        <span>C8</span>
      </div>
      <p className={styles.keyboardHelp}>Use left and right arrow keys to move note by note. Use Home and End to jump to the keyboard edges.</p>
    </section>
  )
}

export default memo(PianoKeyboard)
