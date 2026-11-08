import type { DrumPadDefinition } from '../homeworks/DrumMachine/drumPads'
import styles from './DrumPad.module.css'

type DrumPadProps = {
  pad: DrumPadDefinition
}

export default function DrumPad({ pad }: DrumPadProps) {
  return (
    <button
      className={`${styles.pad} ${styles[pad.tone]}`}
      type="button"
      aria-label={`${pad.name}, ${pad.key} key`}
    >
      <span className={styles.key}>{pad.key}</span>
      <span className={styles.name}>{pad.name}</span>
      <span className={styles.kind}>{pad.kind}</span>
      <span className={styles.corner} aria-hidden="true">↗</span>
    </button>
  )
}
