import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Piano, { generatePianoNotes } from './Piano'

afterEach(() => cleanup())

describe('Piano screen', () => {
  it('generates 88 chromatic notes with 52 white and 36 black keys', () => {
    const notes = generatePianoNotes()
    expect(notes).toHaveLength(88)
    expect(notes[0]).toMatchObject({ midi: 21, label: 'A0', isBlack: false })
    expect(notes.at(-1)).toMatchObject({ midi: 108, label: 'C8', isBlack: false })
    expect(notes.filter((note) => note.isBlack)).toHaveLength(36)
    expect(notes.filter((note) => !note.isBlack)).toHaveLength(52)
  })

  it('renders all generated notes as accessible piano buttons', async () => {
    render(<MemoryRouter><Piano /></MemoryRouter>)
    const keyboard = await screen.findByRole('group', { name: '88 piano keys from A0 to C8' })
    const keys = within(keyboard).getAllByRole('button')
    expect(keys).toHaveLength(88)
    expect(keys[0]?.getAttribute('aria-label')).toBe('A0')
    expect(keys.at(-1)?.getAttribute('aria-label')).toBe('C8')
  })
})
