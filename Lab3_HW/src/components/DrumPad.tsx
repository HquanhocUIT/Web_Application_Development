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
      aria-pressed={pressed}
      tabIndex={tabIndex}
      onClick={() => onPlay(pad)}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
    >
      <span className={styles.key}>{pad.key}</span>
      <span className={styles.name}>{pad.name}</span>
      <span className={styles.kind}>{pad.kind}</span>
      <svg className={styles.corner} aria-hidden="true" focusable="false" viewBox="0 0 16 16">
        <path
          d="M4 12 12 4M5 4h7v7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
