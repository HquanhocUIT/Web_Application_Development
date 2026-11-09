import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Piano from './Piano'
import { midiToFrequency } from './PianoAudioEngine'
import { calculateCenteredScrollLeft, generatePianoNotes, PIANO_NOTES } from './PianoKeyboard'

afterEach(() => cleanup())

describe('Piano screen', () => {
  it('generates 88 chromatic notes with 52 white and 36 black keys', () => {
    const notes = generatePianoNotes()
    expect(notes).toHaveLength(88)
    expect(notes[0]).toMatchObject({ midi: 21, label: 'A0', isBlack: false })
    expect(notes.at(-1)).toMatchObject({ midi: 108, label: 'C8', isBlack: false })
    expect(notes.filter((note) => note.isBlack)).toHaveLength(36)
    expect(notes.filter((note) => !note.isBlack)).toHaveLength(52)
    expect(new Set(notes.map((note) => note.midi)).size).toBe(88)
    notes.forEach((note, index) => {
      expect(note.midi).toBe(index + 21)
      expect(midiToFrequency(note.midi)).toBeCloseTo(440 * 2 ** ((note.midi - 69) / 12), 10)
      if (note.isBlack) {
        expect(notes[index - 1]?.isBlack).toBe(false)
        expect(note.whitePosition).toBe(notes[index - 1]?.whitePosition)
      }
    })
    expect(notes.find((note) => note.midi === 48)?.visualLabel).toBe('C3')
    expect(notes.find((note) => note.midi === 60)?.visualLabel).toBe('C4')
    expect(notes.find((note) => note.midi === 72)?.visualLabel).toBe('C5')
  })

  it('calculates a scroll offset that centers Middle C in the keyboard viewport', () => {
    const middleC = PIANO_NOTES.find((note) => note.midi === 60)
    expect(middleC).toBeDefined()
    const scrollLeft = calculateCenteredScrollLeft(375, 52 * 48, middleC!.whitePosition)
    const keyCenter = (middleC!.whitePosition - 0.5) * (52 * 48 / 52)
    expect(keyCenter - scrollLeft).toBeCloseTo(375 / 2)
  })

  it('renders all generated notes as accessible piano buttons', async () => {
    render(<MemoryRouter><Piano /></MemoryRouter>)
    const keyboard = await screen.findByRole('group', { name: '88 piano keys from A0 to C8' })
    const keys = within(keyboard).getAllByRole('button')
    expect(keys).toHaveLength(88)
    expect(keys[0]?.getAttribute('aria-label')).toBe('A0')
    expect(keys.at(-1)?.getAttribute('aria-label')).toBe('C8')
  })

  it('supports arrow-key movement through notes and Home/End jumps', async () => {
    render(<MemoryRouter><Piano /></MemoryRouter>)
    await screen.findByRole('group', { name: '88 piano keys from A0 to C8' })
    const middleC = screen.getByRole('button', { name: 'C4' })
    middleC.focus()

    fireEvent.keyDown(middleC, { key: 'ArrowRight' })
    expect(document.activeElement?.getAttribute('aria-label')).toBe('C♯4')
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' })
    expect(document.activeElement?.getAttribute('aria-label')).toBe('A0')
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'End' })
    expect(document.activeElement?.getAttribute('aria-label')).toBe('C8')
  })
})
