import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import App from './App'

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
})

function renderAt(path: string) {
  window.history.replaceState({}, '', path)
  return render(<App />)
}

describe('homework routing', () => {
  it('shows links to all homework routes on the homepage', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: /Homework 1.*Production Studio Drum Kit/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Homework 2.*88-Key Polyphonic Piano/ })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Homework 3.*Coming soon/ })).toBeTruthy()
  })

  it('opens the Drum Machine at /hw1', () => {
    renderAt('/hw1')
    expect(screen.getByRole('heading', { level: 1, name: 'Find your rhythm.' })).toBeTruthy()
  })

  it('opens the Piano at /hw2', async () => {
    renderAt('/hw2')
    expect(await screen.findByRole('group', { name: '88 piano keys from A0 to C8' })).toBeTruthy()
  })

  it('shows the temporary page at /hw3', () => {
    renderAt('/hw3')
    expect(screen.getByRole('heading', { level: 1, name: 'Coming soon' })).toBeTruthy()
  })
})
