import { Profiler } from 'react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import PianoKey from './PianoKey'
import type { PianoAudioEngine, PianoVoiceHandle } from './PianoAudioEngine'
import PianoRecordingControls from './PianoRecordingControls'
import { PianoRecorder } from './PianoRecorder'
import type { RecordedPianoNote } from './PianoRecorder'
import {
  calculatePlaybackOffset,
  PianoSequencePlayer,
} from './PianoSequencePlayer'
import type { PianoRecordingController } from './usePianoRecording'
import { usePianoRecording } from './usePianoRecording'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('PianoRecorder', () => {
  it('records overlapping notes in start order with MIDI, frequency, offsets and durations', () => {
    let now = 100
    const recorder = new PianoRecorder(() => now)
    recorder.start()
    now = 125
    expect(recorder.noteOn(60)).toBe(true)
    now = 140
    expect(recorder.noteOn(64)).toBe(true)
    now = 180
    expect(recorder.noteOff(60)).toBe(true)
    now = 200
    expect(recorder.noteOff(64)).toBe(true)
    const notes = recorder.stop()

    expect(notes).toEqual([
      { id: 0, midi: 60, frequency: 261.6255653005986, startOffset: 25, duration: 55 },
      { id: 1, midi: 64, frequency: 329.6275569128699, startOffset: 40, duration: 60 },
    ])
  })

  it('uses the Stop Recording time to finish notes that are still held', () => {
    let now = 0
    const recorder = new PianoRecorder(() => now)
    recorder.start()
    now = 12
    recorder.noteOn(69)
    now = 39

    expect(recorder.stop()[0]).toMatchObject({ midi: 69, startOffset: 12, duration: 27 })
    expect(recorder.isRecording).toBe(false)
  })

  it('ignores duplicate starts for a held MIDI note', () => {
    let now = 0
    const recorder = new PianoRecorder(() => now)
    recorder.start()
    expect(recorder.noteOn(60)).toBe(true)
    now = 10
    expect(recorder.noteOn(60)).toBe(false)
    expect(recorder.stop()).toHaveLength(1)
  })
})

describe('PianoSequencePlayer', () => {
  it('scales original offsets for half, normal and double speed', () => {
    expect(calculatePlaybackOffset(1000, 0.5)).toBe(2000)
    expect(calculatePlaybackOffset(1000, 1)).toBe(1000)
    expect(calculatePlaybackOffset(1000, 2)).toBe(500)
  })

  it('replays overlapping notes at their original offsets and durations', async () => {
    vi.useFakeTimers()
    const audio = createMockAudio()
    const player = new PianoSequencePlayer(audio.engine)
    const notes = [recordedNote(0, 60, 0, 100), recordedNote(1, 64, 50, 100)]
    const playback = player.play(notes, 1)

    await vi.advanceTimersByTimeAsync(0)
    expect(audio.startedMidi).toEqual([60])
    await vi.advanceTimersByTimeAsync(50)
    expect(audio.startedMidi).toEqual([60, 64])
    expect(audio.releasedHandles).toHaveLength(0)
    await vi.advanceTimersByTimeAsync(50)
    expect(audio.releasedHandles).toEqual([audio.handles[0]])
    await vi.advanceTimersByTimeAsync(50)
    expect(audio.releasedHandles).toEqual(audio.handles)
    await playback
  })

  it('cancels pending events and releases active playback voices on Stop', async () => {
    vi.useFakeTimers()
    const audio = createMockAudio()
    const player = new PianoSequencePlayer(audio.engine)
    const playback = player.play([
      recordedNote(0, 60, 0, 100),
      recordedNote(1, 64, 500, 100),
    ], 1)

    await vi.advanceTimersByTimeAsync(0)
    expect(audio.startedMidi).toEqual([60])
    player.stop()
    await vi.advanceTimersByTimeAsync(1000)
    await playback

    expect(audio.releasedHandles).toEqual([audio.handles[0]])
    expect(audio.startedMidi).toEqual([60])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('prevents an aborted playback from continuing after a restart', async () => {
    vi.useFakeTimers()
    const audio = createMockAudio()
    const player = new PianoSequencePlayer(audio.engine)
    const oldPlayback = player.play([recordedNote(0, 60, 500, 100)], 1)
    const newPlayback = player.play([recordedNote(1, 67, 0, 10)], 1)

    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(10)
    await Promise.all([oldPlayback, newPlayback])

    expect(audio.startedMidi).toEqual([67])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('stops playback and releases its voice when the recording hook unmounts', async () => {
    vi.useFakeTimers()
    const audio = createMockAudio()
    const { result, unmount } = renderHook(() => usePianoRecording(audio.engine as PianoAudioEngine))
    act(() => {
      result.current.startRecording()
    })
    act(() => {
      result.current.onNoteStart(60)
      result.current.onNoteEnd(60)
      result.current.stopRecording()
    })
    act(() => {
      result.current.replay()
    })
    await act(async () => { await vi.advanceTimersByTimeAsync(0) })
    expect(audio.startedMidi).toEqual([60])

    unmount()

    expect(audio.releasedHandles).toEqual([audio.handles[0]])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('requests audio readiness synchronously when replay starts', async () => {
    const audio = createMockAudio()
    const player = new PianoSequencePlayer(audio.engine)
    const playback = player.play([recordedNote(0, 60, 0, 10)], 1)
    expect(audio.prepareAudio).toHaveBeenCalledOnce()
    await playback
  })
})

describe('Piano key memoization and transport controls', () => {
  it('commits only the pressed key subtree when one key changes state', () => {
    const audio = createMockAudio()
    const commitCounts = Array<number>(88).fill(0)
    const keyElements: ReactNode[] = []
    for (let index = 0; index < 88; index += 1) {
      const midi = index + 21
      keyElements.push(
        <Profiler
          key={midi}
          id={`piano-key-${midi}`}
          onRender={() => { commitCounts[index] = (commitCounts[index] ?? 0) + 1 }}
        >
          <PianoKey midi={midi} label={`MIDI ${midi}`} engine={audio.engine as PianoAudioEngine} />
        </Profiler>,
      )
    }
    render(<>{keyElements}</>)
    expect(commitCounts.every((count) => count === 1)).toBe(true)

    const midi = 64
    const selectedIndex = midi - 21
    fireEvent.pointerDown(screen.getByRole('button', { name: `MIDI ${midi}` }), {
      pointerId: 12,
      pointerType: 'touch',
      button: 0,
    })

    expect(commitCounts[selectedIndex]).toBe(2)
    expect(commitCounts.filter((_, index) => index !== selectedIndex).every((count) => count === 1)).toBe(true)
  })

  it('exposes recording, replay speed and stop controls accessibly', () => {
    const notes = [recordedNote(0, 60, 0, 100)]
    const controller: PianoRecordingController = {
      isRecording: false,
      isPlaying: false,
      notes,
      playbackSpeed: 1,
      onNoteStart: vi.fn(),
      onNoteEnd: vi.fn(),
      startRecording: vi.fn(),
      stopRecording: vi.fn(),
      setPlaybackSpeed: vi.fn(),
      replay: vi.fn(),
      stopPlayback: vi.fn(),
    }
    const { rerender } = render(<PianoRecordingControls controller={controller} />)

    fireEvent.click(screen.getByRole('button', { name: 'Start Recording' }))
    fireEvent.change(screen.getByLabelText('Replay speed'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Replay' }))

    controller.isRecording = true
    rerender(<PianoRecordingControls controller={controller} />)
    fireEvent.click(screen.getByRole('button', { name: 'Stop Recording' }))

    controller.isRecording = false
    controller.isPlaying = true
    rerender(<PianoRecordingControls controller={controller} />)
    fireEvent.click(screen.getByRole('button', { name: 'Stop Playback' }))

    expect(controller.startRecording).toHaveBeenCalledOnce()
    expect(controller.stopRecording).toHaveBeenCalledOnce()
    expect(controller.setPlaybackSpeed).toHaveBeenCalledWith(2)
    expect(controller.replay).toHaveBeenCalledOnce()
    expect(controller.stopPlayback).toHaveBeenCalledOnce()
    expect(screen.getByRole('status').textContent).toBe('Replaying recording')
  })
})

function recordedNote(id: number, midi: number, startOffset: number, duration: number): RecordedPianoNote {
  return {
    id,
    midi,
    frequency: 440 * 2 ** ((midi - 69) / 12),
    startOffset,
    duration,
  }
}

function createMockAudio() {
  const handles: PianoVoiceHandle[] = []
  const startedMidi: number[] = []
  const releasedHandles: PianoVoiceHandle[] = []
  const prepareAudio = vi.fn(async () => true)
  const startVoice = vi.fn((midi: number) => {
    const handle = { midi, token: Symbol(`mock-${midi}-${handles.length}`) }
    handles.push(handle)
    startedMidi.push(midi)
    return handle
  })
  const releaseVoiceHandle = vi.fn((handle: PianoVoiceHandle) => {
    releasedHandles.push(handle)
    return true
  })
  return {
    handles,
    startedMidi,
    releasedHandles,
    prepareAudio,
    engine: {
      prepareAudio,
      startVoice,
      releaseVoiceHandle,
    } as unknown as Pick<PianoAudioEngine, 'prepareAudio' | 'startVoice' | 'releaseVoiceHandle'>,
  }
}
