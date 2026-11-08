import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DrumMachine from './DrumMachine'
import { DRUM_PADS } from './drumPads'

class FakeAudioParam {
  setValueAtTime() {}
  exponentialRampToValueAtTime() {}
}

class FakeNode {
  disconnect = vi.fn()

  connect(node: FakeNode) {
    return node
  }
}

class FakeSource extends FakeNode {
  onended: (() => void) | null = null
  start = vi.fn()
  stop = vi.fn()
  frequency = new FakeAudioParam()
  gain = new FakeAudioParam()
  type = 'sine'
  buffer: unknown
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = []
  readonly state: AudioContextState = 'running'
  readonly currentTime = 1
  readonly sampleRate = 8000
  readonly destination = new FakeNode()
  readonly sources: FakeSource[] = []
  close = vi.fn(async () => undefined)
  resume = vi.fn(async () => undefined)

  constructor() {
    FakeAudioContext.instances.push(this)
  }

  createOscillator() {
    return this.makeSource()
  }

  createBufferSource() {
    return this.makeSource()
  }

  createGain() {
    return new FakeSource()
  }

  createBiquadFilter() {
    const filter = new FakeSource()
    filter.frequency = new FakeAudioParam()
    return filter
  }

  createBuffer(_channels: number, length: number) {
    const samples = new Float32Array(length)
    return { getChannelData: () => samples }
  }

  private makeSource() {
    const source = new FakeSource()
    this.sources.push(source)
    return source
  }
}

describe('drum pad controls', () => {
  beforeEach(() => {
    FakeAudioContext.instances = []
    vi.stubGlobal('AudioContext', FakeAudioContext)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('plays each of the seven sounds from its mouse pad', () => {
    render(<DrumMachine />)

    for (const pad of DRUM_PADS) {
      const context = FakeAudioContext.instances[0]
      const before = context?.sources.length ?? 0
      fireEvent.click(screen.getByRole('button', { name: `${pad.name}, ${pad.key} key` }))
      const expectedSources = pad.key === 'A' ? 2 : 1
      expect(FakeAudioContext.instances[0]?.sources).toHaveLength(before + expectedSources)
      expect(FakeAudioContext.instances[0]?.sources.slice(before).every((source) => source.start.mock.calls.length === 1)).toBe(true)
    }
  })

  it('plays each mapped sound from e.code and ignores repeats and typing targets', () => {
    render(<DrumMachine />)

    for (const pad of DRUM_PADS) {
      const context = FakeAudioContext.instances[0]
      const before = context?.sources.length ?? 0
      fireEvent.keyDown(window, { code: `Key${pad.key}`, repeat: false })
      const expectedSources = pad.key === 'A' ? 2 : 1
      expect(FakeAudioContext.instances[0]?.sources).toHaveLength(before + expectedSources)
    }

    const sourceCount = FakeAudioContext.instances[0]?.sources.length
    fireEvent.keyDown(window, { code: 'KeyW', repeat: true })
    fireEvent.keyDown(window, { code: '', key: 'w', repeat: false })

    const typingTargets = [
      document.createElement('input'),
      document.createElement('textarea'),
      document.createElement('select'),
      document.createElement('div'),
    ]
    typingTargets[3]?.setAttribute('contenteditable', 'true')
    for (const target of typingTargets) {
      document.body.append(target)
      fireEvent.keyDown(target, { code: 'KeyW', repeat: false })
      target.remove()
    }

    expect(FakeAudioContext.instances[0]?.sources).toHaveLength(sourceCount ?? 0)
  })

  it('removes its keyboard listener and closes audio resources on unmount', () => {
    const addListener = vi.spyOn(window, 'addEventListener')
    const removeListener = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<DrumMachine />)

    fireEvent.click(screen.getByRole('button', { name: 'Kick, W key' }))
    const context = FakeAudioContext.instances[0]
    const listener = addListener.mock.calls.find(([type]) => type === 'keydown')?.[1]
    unmount()

    expect(listener).toBeTypeOf('function')
    expect(removeListener).toHaveBeenCalledWith('keydown', listener)
    expect(context?.close).toHaveBeenCalledOnce()
    expect(context?.sources[0]?.stop).toHaveBeenCalledTimes(2)
    expect(context?.sources[0]?.disconnect).toHaveBeenCalledOnce()
  })
})
