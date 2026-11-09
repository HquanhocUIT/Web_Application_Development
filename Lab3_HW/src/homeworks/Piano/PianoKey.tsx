import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { PianoAudioEngine } from './PianoAudioEngine'
import styles from './PianoKey.module.css'

type PianoKeyProps = {
  midi: number
  label: string
  engine: PianoAudioEngine
}

function PianoKey({ midi, label, engine }: PianoKeyProps) {
  const heldInputs = useRef(new Set<string>())
  const [pressed, setPressed] = useState(false)

  const press = useCallback((source: string) => {
    if (heldInputs.current.has(source)) return
    const wasReleased = heldInputs.current.size === 0
    heldInputs.current.add(source)
    if (wasReleased) engine.startNote(midi)
    setPressed(true)
  }, [engine, midi])

  const release = useCallback((source: string) => {
    if (!heldInputs.current.delete(source)) return
    if (heldInputs.current.size === 0) {
      engine.releaseNote(midi)
      setPressed(false)
    }
  }, [engine, midi])

  const handlePointerDown = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    press(`pointer:${event.pointerId}`)
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is not available in every test environment.
    }
  }, [press])

  const releasePointer = useCallback((event: PointerEvent<HTMLButtonElement>) => {
    release(`pointer:${event.pointerId}`)
  }, [release])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.repeat || (event.key !== ' ' && event.key !== 'Enter')) return
    event.preventDefault()
    press(`keyboard:${event.key}`)
  }, [press])

  const handleKeyUp = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') release(`keyboard:${event.key}`)
  }, [release])

  const handleBlur = useCallback(() => {
    for (const source of heldInputs.current) {
      if (source.startsWith('keyboard:')) release(source)
    }
  }, [release])

  useEffect(() => () => {
    heldInputs.current.clear()
    engine.releaseNote(midi)
  }, [engine, midi])

  return (
    <button
      className={`${styles.key} ${pressed ? styles.pressed : ''}`}
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onPointerDown={handlePointerDown}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onLostPointerCapture={releasePointer}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={handleBlur}
    >
      {label}
    </button>
  )
}

export default memo(PianoKey)
