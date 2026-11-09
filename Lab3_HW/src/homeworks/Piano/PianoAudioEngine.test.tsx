import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import PianoKey from './PianoKey'
import {
  MAX_PIANO_VOICES,
  NOTE_RELEASE_SECONDS,
  midiToFrequency,
  PianoAudioEngine,
} from './PianoAudioEngine'

class FakeAudioParam {
  value = 0
  setValueAtTime = vi.fn((value: number) => { this.value = value })
  linearRampToValueAtTime = vi.fn((value: number) => { this.value = value })
  cancelScheduledValues = vi.fn()
}

class FakeOscillator {
  frequency = new FakeAudioParam()
  type: OscillatorType = 'sine'
  onended: (() => void) | null = null
  start = vi.fn()
  stop = vi.fn()
  connect = vi.fn()
  disconnect = vi.fn()
}

class FakeGain {
  gain = new FakeAudioParam()
  connect = vi.fn()
  disconnect = vi.fn()
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = []
  static initialState: AudioContextState = 'running'
  state = FakeAudioContext.initialState
  currentTime = 12
  destination = {}
  oscillators: FakeOscillator[] = []
  gains: FakeGain[] = []
  close = vi.fn(async () => { this.state = 'closed' })
  resume = vi.fn(async () => { this.state = 'running' })

  constructor() {
    FakeAudioContext.instances.push(this)
  }

  createOscillator() {
    const oscillator = new FakeOscillator()
    this.oscillators.push(oscillator)
    return oscillator as unknown as OscillatorNode
  }

  createGain() {
    const gain = new FakeGain()
    this.gains.push(gain)
    return gain as unknown as GainNode
  }
}

describe('PianoAudioEngine', () => {
  let engine: PianoAudioEngine

  beforeEach(() => {
    FakeAudioContext.initialState = 'running'
    FakeAudioContext.instances = []
    vi.stubGlobal('AudioContext', FakeAudioContext)
    engine = new PianoAudioEngine()
  })

  afterEach(() => {
    cleanup()
    engine.dispose()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('keeps no more than eight active voices and steals the oldest note first', () => {
    for (let midi = 60; midi < 60 + MAX_PIANO_VOICES; midi += 1) {
      expect(engine.startNote(midi)).toBe(true)
    }
    const context = getCreatedContext()

    expect(engine.getActiveNotes()).toEqual([60, 61, 62, 63, 64, 65, 66, 67])
    expect(engine.startNote(68)).toBe(true)
    expect(engine.getActiveNotes()).toEqual([61, 62, 63, 64, 65, 66, 67, 68])
    expect(engine.getActiveNotes()).toHaveLength(MAX_PIANO_VOICES)
    expect(context.oscillators[0]?.stop).toHaveBeenCalledWith(12 + NOTE_RELEASE_SECONDS)
    expect(context.oscillators.slice(1).some((oscillator) => oscillator.stop.mock.calls.length > 0)).toBe(false)
  })

  it('does not create a duplicate oscillator for a note that is already active', () => {
    expect(engine.startNote(64)).toBe(true)
    const context = getCreatedContext()
    expect(engine.startNote(64)).toBe(false)
    expect(context.oscillators).toHaveLength(1)
    expect(engine.getActiveNotes()).toEqual([64])
  })

  it('does not let a released old voice remove a newer voice with the same MIDI note', () => {
    engine.startNote(60)
    const context = getCreatedContext()
    const releasedVoice = context.oscillators[0]
    engine.releaseNote(60)
    engine.startNote(60)

    releasedVoice?.onended?.()

    expect(engine.getActiveNotes()).toEqual([60])
    expect(context.oscillators[1]?.start).toHaveBeenCalledOnce()
  })

  it('uses the MIDI frequency formula for each note from A0 through C8', () => {
    for (let midi = 21; midi <= 108; midi += 1) {
      engine.startNote(midi)
    }
    const context = getCreatedContext()

    expect(context.oscillators).toHaveLength(88)
    context.oscillators.forEach((oscillator, index) => {
      const midi = index + 21
      expect(oscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        440 * 2 ** ((midi - 69) / 12),
        12,
      )
      expect(oscillator.start).toHaveBeenCalledOnce()
    })
    expect(midiToFrequency(69)).toBe(440)
    expect(engine.getActiveNotes()).toHaveLength(MAX_PIANO_VOICES)
  })

  it('ramps gain down on release, then disconnects the oscillator and gain node', () => {
    engine.startNote(69)
    const context = getCreatedContext()
    const oscillator = context.oscillators[0]
    const gain = context.gains[0]
    expect(engine.releaseNote(69)).toBe(true)
    expect(engine.getActiveNotes()).toEqual([])
    expect(gain?.gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0, 12 + NOTE_RELEASE_SECONDS)
    expect(oscillator?.stop).toHaveBeenCalledWith(12 + NOTE_RELEASE_SECONDS)

    oscillator?.onended?.()
    expect(oscillator?.disconnect).toHaveBeenCalledOnce()
    expect(gain?.disconnect).toHaveBeenCalledOnce()
  })

  it('stops and disconnects active audio nodes when disposed', () => {
    engine.startNote(72)
    const context = getCreatedContext()
    const oscillator = context.oscillators[0]
    const gain = context.gains[0]

    engine.dispose()

    expect(oscillator?.stop).toHaveBeenCalledOnce()
    expect(oscillator?.disconnect).toHaveBeenCalledOnce()
    expect(gain?.disconnect).toHaveBeenCalledOnce()
    expect(context.close).toHaveBeenCalledOnce()
    expect(engine.startNote(73)).toBe(false)
  })

  it('resumes a suspended AudioContext after a note is requested', async () => {
    FakeAudioContext.initialState = 'suspended'
    const suspendedEngine = new PianoAudioEngine()
    suspendedEngine.startNote(60)
    const context = getCreatedContext()
    expect(context.resume).toHaveBeenCalledOnce()
    await Promise.resolve()
    expect(context.oscillators[0]?.start).toHaveBeenCalledOnce()
    suspendedEngine.dispose()
  })
})

describe('PianoKey input handling', () => {
  afterEach(() => cleanup())

  it('starts on pointer down and releases on pointer up or cancellation', () => {
    const engine = {
      startVoice: vi.fn(() => ({ midi: 60, token: Symbol('test-voice') })),
      releaseVoiceHandle: vi.fn(),
    } as unknown as PianoAudioEngine
    const onNoteStart = vi.fn()
    const onNoteEnd = vi.fn()
    render(
      <PianoKey
        midi={60}
        label="C4"
        engine={engine}
        onNoteStart={onNoteStart}
        onNoteEnd={onNoteEnd}
      />,
    )
    const key = screen.getByRole('button', { name: 'C4' })

    fireEvent.pointerDown(key, { pointerId: 3, pointerType: 'touch', button: 0 })
    expect(engine.startVoice).toHaveBeenCalledOnce()
    expect(key.getAttribute('aria-pressed')).toBe('true')
    fireEvent.pointerCancel(key, { pointerId: 3, pointerType: 'touch' })
    expect(engine.releaseVoiceHandle).toHaveBeenCalledOnce()
    expect(key.getAttribute('aria-pressed')).toBe('false')

    fireEvent.pointerDown(key, { pointerId: 4, pointerType: 'mouse', button: 0 })
    fireEvent.pointerUp(key, { pointerId: 4, pointerType: 'mouse', button: 0 })
    expect(engine.startVoice).toHaveBeenCalledTimes(2)
    expect(engine.releaseVoiceHandle).toHaveBeenCalledTimes(2)
    expect(onNoteStart).toHaveBeenCalledTimes(2)
    expect(onNoteEnd).toHaveBeenCalledTimes(2)
  })

  it('starts and releases keyboard notes and ignores repeated keydown events', () => {
    const engine = {
      startVoice: vi.fn(() => ({ midi: 60, token: Symbol('test-voice') })),
      releaseVoiceHandle: vi.fn(),
    } as unknown as PianoAudioEngine
    render(<PianoKey midi={60} label="C4" engine={engine} />)
    const key = screen.getByRole('button', { name: 'C4' })

    fireEvent.keyDown(key, { key: ' ', repeat: false })
    fireEvent.keyDown(key, { key: ' ', repeat: true })
    expect(engine.startVoice).toHaveBeenCalledOnce()
    fireEvent.keyUp(key, { key: ' ' })
    expect(engine.releaseVoiceHandle).toHaveBeenCalledOnce()
  })

  it('keeps one voice active when pointer and keyboard input overlap', () => {
    const engine = {
      startVoice: vi.fn(() => ({ midi: 60, token: Symbol('test-voice') })),
      releaseVoiceHandle: vi.fn(),
    } as unknown as PianoAudioEngine
    render(<PianoKey midi={60} label="C4" engine={engine} />)
    const key = screen.getByRole('button', { name: 'C4' })

    fireEvent.pointerDown(key, { pointerId: 5, pointerType: 'mouse', button: 0 })
    fireEvent.keyDown(key, { key: 'Enter', repeat: false })
    fireEvent.pointerUp(key, { pointerId: 5, pointerType: 'mouse', button: 0 })

    expect(engine.startVoice).toHaveBeenCalledOnce()
    expect(engine.releaseVoiceHandle).not.toHaveBeenCalled()
    expect(key.getAttribute('aria-pressed')).toBe('true')

    fireEvent.keyUp(key, { key: 'Enter' })
    expect(engine.releaseVoiceHandle).toHaveBeenCalledOnce()
    expect(key.getAttribute('aria-pressed')).toBe('false')
  })
})

function getCreatedContext(): FakeAudioContext {
  const context = FakeAudioContext.instances.at(-1)
  if (!context) throw new Error('AudioContext has not been initialized by a user-triggered note.')
  return context
}
