import type { DrumPadDefinition } from '../homeworks/DrumMachine/drumPads'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import styles from './DrumPad.module.css'

type DrumPadProps = {
  pad: DrumPadDefinition
  onPlay: (pad: DrumPadDefinition) => void
  pressed: boolean
  tabIndex: 0 | -1
  buttonRef: (element: HTMLButtonElement | null) => void
  onFocus: () => void
  onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void
}

export default function DrumPad({
  pad,
  onPlay,
  pressed,
  tabIndex,
  buttonRef,
  onFocus,
  onKeyDown,
}: DrumPadProps) {
  return (
    <button
      ref={buttonRef}
      className={`${styles.pad} ${styles[pad.tone]}`}
      type="button"
      aria-label={`${pad.name}, ${pad.key} key`}
      aria-pressed={pressed}
      tabIndex={tabIndex}
      onClick={() => onPlay(pad)}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
    >
      <span className={styles.key}>{pad.key}</span>
      <span className={styles.name}>{pad.name}</span>
      <span className={styles.kind}>{pad.kind}</span>
      <span className={styles.corner} aria-hidden="true">↗</span>
    </button>
  )
}
