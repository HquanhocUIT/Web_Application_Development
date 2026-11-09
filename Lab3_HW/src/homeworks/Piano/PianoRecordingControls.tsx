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
    ? 'Recording notes'
    : controller.isPlaying
      ? 'Replaying recording'
      : `${controller.notes.length} recorded notes`

  return (
    <section className={styles.controls} aria-label="Piano recording and playback">
      <div className={styles.recordingButtons}>
        <button type="button" onClick={controller.startRecording} disabled={controller.isRecording}>
          Start Recording
        </button>
        <button type="button" onClick={controller.stopRecording} disabled={!controller.isRecording}>
          Stop Recording
        </button>
      </div>

      <label className={styles.speedControl}>
        Replay speed
        <select value={controller.playbackSpeed} onChange={handleSpeedChange}>
          {PLAYBACK_SPEEDS.map((speed) => (
            <option key={speed} value={speed}>{speed}x</option>
          ))}
        </select>
      </label>

      <div className={styles.playbackButtons}>
        <button
          type="button"
          onClick={controller.replay}
          disabled={controller.isRecording || controller.notes.length === 0 || controller.isPlaying}
        >
          Replay
        </button>
        <button type="button" onClick={controller.stopPlayback} disabled={!controller.isPlaying}>
          Stop Playback
        </button>
      </div>
      <p className={styles.status} role="status" aria-live="polite">{status}</p>
    </section>
  )
}
