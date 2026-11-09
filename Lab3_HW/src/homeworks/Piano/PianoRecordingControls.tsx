import type { ChangeEvent } from 'react'
import type { PianoRecordingController } from './usePianoRecording'
import { PLAYBACK_SPEEDS } from './PianoSequencePlayer'
import styles from './PianoRecordingControls.module.css'

export default function PianoRecordingControls({
  controller,
}: {
  controller: PianoRecordingController
}) {
  function handleSpeedChange(event: ChangeEvent<HTMLSelectElement>) {
    const speed = Number(event.currentTarget.value)
    if (PLAYBACK_SPEEDS.includes(speed as (typeof PLAYBACK_SPEEDS)[number])) {
      controller.setPlaybackSpeed(speed as (typeof PLAYBACK_SPEEDS)[number])
    }
  }

  const status = controller.isRecording
    ? 'Recording in progress'
    : controller.isPlaying
      ? 'Playing your take'
      : `${controller.notes.length} notes in this take`

  return (
    <section className={styles.panel} aria-labelledby="transport-title">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Transport</p>
          <h2 id="transport-title">Recording & playback</h2>
        </div>
        <p className={`${styles.status} ${controller.isRecording ? styles.recording : ''}`} role="status" aria-live="polite">
          <span className={styles.statusDot} aria-hidden="true" />
          {status}
        </p>
      </header>

      <div className={styles.controlRow}>
        <div className={styles.buttonGroup} role="group" aria-label="Recording controls">
          <button
            className={styles.recordButton}
            type="button"
            onClick={controller.startRecording}
            disabled={controller.isRecording}
            aria-pressed={controller.isRecording}
          >
            <span className={styles.recordIcon} aria-hidden="true" />
            Start Recording
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={controller.stopRecording}
            disabled={!controller.isRecording}
          >
            Stop Recording
          </button>
        </div>

        <div className={styles.speedControl}>
          <label htmlFor="piano-playback-speed">Playback speed</label>
          <select id="piano-playback-speed" value={controller.playbackSpeed} onChange={handleSpeedChange}>
            {PLAYBACK_SPEEDS.map((speed) => (
              <option key={speed} value={speed}>{speed}x</option>
            ))}
          </select>
        </div>

        <div className={styles.buttonGroup} role="group" aria-label="Playback controls">
          <button
            className={styles.playButton}
            type="button"
            onClick={controller.replay}
            disabled={controller.isRecording || controller.notes.length === 0 || controller.isPlaying}
          >
            Replay
          </button>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={controller.stopPlayback}
            disabled={!controller.isPlaying}
          >
            Stop Playback
          </button>
        </div>
      </div>
    </section>
  )
}
