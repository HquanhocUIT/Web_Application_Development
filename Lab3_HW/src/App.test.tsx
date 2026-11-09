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
    expect(screen.getByRole('link', { name: /Homework 3.*PUBG Vietnam Arena/ })).toBeTruthy()
  })

  it('opens the Drum Machine at /hw1', () => {
    renderAt('/hw1')
    expect(screen.getByRole('heading', { level: 1, name: 'Find your rhythm.' })).toBeTruthy()
  })

  it('opens the Piano at /hw2', async () => {
    renderAt('/hw2')
    expect(await screen.findByRole('group', { name: '88 piano keys from A0 to C8' })).toBeTruthy()
  })

  it('opens the PUBG Vietnam Arena dashboard at /hw3', () => {
    renderAt('/hw3')
    expect(screen.getByRole('heading', { level: 1, name: 'KRAFTON × PUBG Vietnam' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Airdrop rewards' })).toBeTruthy()
    expect(screen.getByText('Grand Finals VIP Pass')).toBeTruthy()
    expect(screen.getByText('5,000 G-COIN')).toBeTruthy()
    expect(screen.getByRole('heading', { name: /leaderboard/ })).toBeTruthy()
    expect(screen.getByText('The Expendables')).toBeTruthy()
    expect(screen.getByText('Cerberus Esports')).toBeTruthy()
    expect(screen.getByText('Roy Esports')).toBeTruthy()
    expect(screen.getAllByText('AGG')).toHaveLength(2)
  })
})
