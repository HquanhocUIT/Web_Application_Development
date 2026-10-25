import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AudioDecoder, type AudioFftSize, type AudioPlaybackPipeline } from './audio/audio-decoder'
import { AudioTaskQueue } from './audio/audio-task-queue'
import { AudioVisualizer } from './components/AudioVisualizer'
import type { AudioTaskQueueSnapshot } from './types/audio-task'
import './App.css'

const EMPTY_QUEUE: AudioTaskQueueSnapshot = {
  tasks: [],
  pendingTaskIds: [],
  processingTaskId: null,
}

function App() {
  const [audioUrl, setAudioUrl] = useState('')
  const [queueSnapshot, setQueueSnapshot] = useState(EMPTY_QUEUE)
  const [decodedTaskIds, setDecodedTaskIds] = useState<string[]>([])
  const [fftSize, setFftSize] = useState<AudioFftSize>(256)
  const [playingTaskId, setPlayingTaskId] = useState<string | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [message, setMessage] = useState('Add an audio URL to begin.')

  const queueRef = useRef<AudioTaskQueue<AudioBuffer> | null>(null)
  const decoderRef = useRef<AudioDecoder | null>(null)
  const playbackRef = useRef<AudioPlaybackPipeline | null>(null)
  const decodedAudioRef = useRef(new Map<string, AudioBuffer>())
  const isMountedRef = useRef(false)

  useEffect(() => {
    let isMounted = true
    isMountedRef.current = true
    const decoder = new AudioDecoder()
    const queue = new AudioTaskQueue<AudioBuffer>({
      processTask: decoder.processTask,
      onChange(snapshot) {
        if (isMounted) {
          setQueueSnapshot(snapshot)
        }
      },
    })

    decoderRef.current = decoder
    queueRef.current = queue
    return () => {
      isMounted = false
      isMountedRef.current = false

      if (queueRef.current === queue) {
        queueRef.current = null
      }
      if (decoderRef.current === decoder) {
        decoderRef.current = null
      }

      stopPlaybackPipeline(playbackRef.current)
      playbackRef.current = null
      void queue.cleanup()
        .then(() => decoder.cleanup())
        .catch((error: unknown) => {
          console.error('Could not clean up audio resources.', error)
        })
    }
  }, [])

  function handleAddAudio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const queue = queueRef.current
    const url = audioUrl.trim()

    if (!queue || !url) {
      setMessage('The audio queue is not ready yet. Please try again.')
      return
    }

    try {
      const task = queue.enqueue(url)
      setAudioUrl('')
      setMessage(`Added task ${task.taskId} to the end of the queue.`)

      void task.promise.then(
        (audioBuffer) => {
          if (!isMountedRef.current) {
            return
          }

          decodedAudioRef.current.set(task.taskId, audioBuffer)
          setDecodedTaskIds([...decodedAudioRef.current.keys()])
          setMessage(`Task ${task.taskId} is ready to play.`)
        },
        (error: unknown) => {
          if (!isMountedRef.current) {
            return
          }

          if (isAbortError(error)) {
            setMessage(`Task ${task.taskId} was cancelled.`)
          } else {
            setMessage(`Task ${task.taskId} failed: ${getErrorMessage(error)}`)
          }
        },
      )
    } catch (error) {
      setMessage(`Could not add the audio task: ${getErrorMessage(error)}`)
    }
  }

  function handleCancel(taskId: string) {
    const wasCancelled = queueRef.current?.cancel(taskId) ?? false
    setMessage(
      wasCancelled
        ? `Cancellation requested for task ${taskId}.`
        : `Task ${taskId} can no longer be cancelled.`,
    )
  }

  async function handlePlay(taskId: string) {
    const decoder = decoderRef.current
    const audioBuffer = decodedAudioRef.current.get(taskId)

    if (!decoder || !audioBuffer) {
      setMessage(`Task ${taskId} does not have decoded audio yet.`)
      return
    }

    stopPlaybackPipeline(playbackRef.current)
    playbackRef.current = null
    setAnalyser(null)
    setPlayingTaskId(null)

    let requestedPipeline: AudioPlaybackPipeline | null = null

    try {
      const pipeline = decoder.createPlaybackPipeline(audioBuffer, fftSize)
      requestedPipeline = pipeline
      playbackRef.current = pipeline
      setAnalyser(pipeline.analyser)
      setPlayingTaskId(taskId)
      setMessage(`Starting playback of task ${taskId}.`)
      pipeline.setOnEnded(() => {
        if (playbackRef.current === pipeline) {
          playbackRef.current = null
          setAnalyser(null)
          setPlayingTaskId(null)
          setMessage(`Playback of task ${taskId} finished.`)
        }
      })

      await pipeline.start()

      if (playbackRef.current === pipeline) {
        setMessage(`Playing task ${taskId}.`)
      }
    } catch (error) {
      if (requestedPipeline && playbackRef.current !== requestedPipeline) {
        return
      }

      if (requestedPipeline && playbackRef.current === requestedPipeline) {
        stopPlaybackPipeline(requestedPipeline)
        playbackRef.current = null
      }
      setAnalyser(null)
      setPlayingTaskId(null)
      setMessage(`Could not play task ${taskId}: ${getErrorMessage(error)}`)
    }
  }

  function handleStop() {
    const stoppedTaskId = playingTaskId
    stopPlaybackPipeline(playbackRef.current)
    playbackRef.current = null
    setAnalyser(null)
    setPlayingTaskId(null)
    setMessage(stoppedTaskId ? `Playback of task ${stoppedTaskId} stopped.` : 'Playback stopped.')
  }

  function handleFftSizeChange(value: string) {
    const nextFftSize: AudioFftSize = value === '512' ? 512 : 256
    setFftSize(nextFftSize)

    if (playbackRef.current) {
      playbackRef.current.analyser.fftSize = nextFftSize
    }
  }

  return (
    <main className="app-shell">
      <div className="app-content">
        <header className="page-header">
          <p className="eyebrow">Homework 2 · Web Audio API</p>
          <h1>Concurrent FIFO Audio Visualizer Queue Engine</h1>
          <p className="page-description">
            Add audio URLs to a first-in, first-out queue, then play decoded audio
            with a live frequency visualizer.
          </p>
        </header>

        <section className="panel" aria-labelledby="add-audio-heading">
          <h2 id="add-audio-heading">Add audio</h2>
          <form className="audio-form" onSubmit={handleAddAudio}>
            <label htmlFor="audio-url">Audio URL</label>
            <div className="audio-form__controls">
              <input
                id="audio-url"
                name="audioUrl"
                type="url"
                value={audioUrl}
                onChange={(event) => setAudioUrl(event.target.value)}
                placeholder="https://example.com/audio.mp3"
                required
              />
              <button type="submit" className="button button--primary">
                Add to Queue
              </button>
            </div>
            <p className="field-help">
              Tasks are downloaded and decoded one at a time in the order added.
            </p>
          </form>
        </section>

        <section className="panel" aria-labelledby="queue-heading">
          <div className="section-heading">
            <div>
              <h2 id="queue-heading">Audio queue</h2>
              <p>Tasks appear in the order they were added.</p>
            </div>
            <span className="queue-count">
              {queueSnapshot.tasks.length} {queueSnapshot.tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {queueSnapshot.tasks.length === 0 ? (
            <p className="empty-state">No audio tasks yet. Add a URL above.</p>
          ) : (
            <ol className="task-list" aria-label="Audio tasks in FIFO order">
              {queueSnapshot.tasks.map((task, index) => {
                const canCancel = task.status === 'pending' || task.status === 'processing'
                const canPlay = task.status === 'completed' && decodedTaskIds.includes(task.id)
                const isPlaying = playingTaskId === task.id

                return (
                  <li className="task-card" key={task.id}>
                    <div className="task-card__content">
                      <p className="task-card__title">
                        <span className="task-number">{index + 1}</span>
                        <span className="task-url">{task.url}</span>
                      </p>
                      <div className="task-card__meta">
                        <span className={`task-status task-status--${task.status}`}>
                          {task.status}
                        </span>
                        {task.error !== null && task.status === 'failed' && (
                          <span className="task-error">{getErrorMessage(task.error)}</span>
                        )}
                      </div>
                    </div>
                    <div className="task-card__actions">
                      {canPlay && (
                        <button
                          type="button"
                          className="button button--secondary"
                          onClick={() => void handlePlay(task.id)}
                          disabled={isPlaying}
                        >
                          {isPlaying ? 'Playing' : 'Play'} task {index + 1}
                        </button>
                      )}
                      {canCancel && (
                        <button
                          type="button"
                          className="button button--quiet"
                          onClick={() => handleCancel(task.id)}
                          aria-label={`Cancel task ${index + 1}`}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <section className="panel playback-panel" aria-labelledby="playback-heading">
          <div className="section-heading playback-panel__heading">
            <div>
              <h2 id="playback-heading">Playback and visualizer</h2>
              <p>
                {playingTaskId
                  ? `Task ${playingTaskId} is playing.`
                  : 'Choose a completed task to play its audio.'}
              </p>
            </div>
            <div className="playback-controls">
              <div className="fft-control">
                <label htmlFor="fft-size">FFT size</label>
                <select
                  id="fft-size"
                  value={fftSize}
                  onChange={(event) => handleFftSizeChange(event.target.value)}
                >
                  <option value={256}>256</option>
                  <option value={512}>512</option>
                </select>
              </div>
              <button
                type="button"
                className="button button--stop"
                onClick={handleStop}
                disabled={!playingTaskId}
              >
                Stop audio
              </button>
            </div>
          </div>
          <AudioVisualizer analyser={analyser} />
        </section>

        <p className="app-message" role="status" aria-live="polite" aria-atomic="true">
          {message}
        </p>
      </div>
    </main>
  )
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unknown error occurred.'
}

function isAbortError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'name' in error
    && error.name === 'AbortError'
}

function stopPlaybackPipeline(pipeline: AudioPlaybackPipeline | null): void {
  try {
    pipeline?.stop()
  } catch (error) {
    console.error('Could not stop the audio playback pipeline.', error)
  }
}

export default App
