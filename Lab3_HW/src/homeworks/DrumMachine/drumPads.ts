export type PadTone = 'coral' | 'amber' | 'blue' | 'plum'

export type DrumPadDefinition = {
  key: 'W' | 'A' | 'S' | 'D' | 'J' | 'K' | 'L'
  name: string
  kind: string
  tone: PadTone
}

export const DRUM_PADS: DrumPadDefinition[] = [
  { key: 'W', name: 'Kick', kind: 'Low drum', tone: 'coral' },
  { key: 'A', name: 'Snare', kind: 'Backbeat', tone: 'blue' },
  { key: 'S', name: 'Closed Hat', kind: 'Cymbal', tone: 'amber' },
  { key: 'D', name: 'Open Hat', kind: 'Cymbal', tone: 'plum' },
  { key: 'J', name: 'High Tom', kind: 'Tom', tone: 'blue' },
  { key: 'K', name: 'Clap', kind: 'Percussion', tone: 'coral' },
  { key: 'L', name: 'Crash', kind: 'Cymbal', tone: 'amber' },
]
