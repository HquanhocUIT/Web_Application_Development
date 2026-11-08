import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
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

class FakeAnalyser extends FakeNode {
  fftSize = 32
  amplitude = 0

  getFloatTimeDomainData(samples: Float32Array) {
    samples.fill(this.amplitude)
  }
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = []
  readonly state: AudioContextState = 'running'
  readonly currentTime = 1
  readonly sampleRate = 8000
  readonly destination = new FakeNode()
  readonly sources: FakeSource[] = []
  analyser: FakeAnalyser | null = null
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

  createAnalyser() {
    this.analyser = new FakeAnalyser()
    return this.analyser
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
    vi.useRealTimers()
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

  it('announces hits and exposes a temporary pressed state', () => {
    vi.useFakeTimers()
    render(<DrumMachine />)
    const kick = screen.getByRole('button', { name: 'Kick, W key' })
    const log = screen.getByRole('log', { name: 'Recent drum hits' })

    expect(kick.getAttribute('aria-pressed')).toBe('false')
    expect(log.getAttribute('aria-live')).toBe('polite')
    fireEvent.click(kick)

    expect(kick.getAttribute('aria-pressed')).toBe('true')
    expect(log.textContent).toContain('W')
    expect(log.textContent).toContain('Kick')
    act(() => { vi.advanceTimersByTime(200) })
    expect(kick.getAttribute('aria-pressed')).toBe('false')
  })

  it('updates the accessible decibel meter from the analyser signal', () => {
    vi.useFakeTimers()
    render(<DrumMachine />)
    fireEvent.click(screen.getByRole('button', { name: 'Kick, W key' }))
    const analyser = FakeAudioContext.instances[0]?.analyser
    if (!analyser) throw new Error('The audio analyser was not created.')
    analyser.amplitude = 0.5

    act(() => { vi.advanceTimersByTime(100) })

    expect(screen.getByRole('meter', { name: 'Output level in decibels' })
      .getAttribute('aria-valuetext')).toBe('-6 dBFS')
  })

  it('supports roving arrow, Home and End navigation across pads', () => {
    render(<DrumMachine />)
    const buttons = DRUM_PADS.map(({ name, key }) => screen.getByRole('button', { name: `${name}, ${key} key` }))
    expect(buttons[0]?.getAttribute('tabindex')).toBe('0')
    expect(buttons[1]?.getAttribute('tabindex')).toBe('-1')

    buttons[0]?.focus()
    fireEvent.keyDown(buttons[0] as HTMLButtonElement, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[1])
    expect(buttons[1]?.getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(buttons[1] as HTMLButtonElement, { key: 'End', code: 'End' })
    expect(document.activeElement).toBe(buttons[6])
    fireEvent.keyDown(buttons[6] as HTMLButtonElement, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[0])

    fireEvent.keyDown(buttons[0] as HTMLButtonElement, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(document.activeElement).toBe(buttons[4])
    fireEvent.keyDown(buttons[4] as HTMLButtonElement, { key: 'ArrowUp', code: 'ArrowUp' })
    expect(document.activeElement).toBe(buttons[0])
  })

  it('clears visual-feedback and meter timers when unmounted', () => {
    vi.useFakeTimers()
    const { unmount } = render(<DrumMachine />)
    fireEvent.click(screen.getByRole('button', { name: 'Kick, W key' }))
    expect(vi.getTimerCount()).toBe(2)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
