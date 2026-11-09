import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PianoAudioEngine } from './PianoAudioEngine'
import type { RecordedPianoNote } from './PianoRecorder'
import { PianoRecorder } from './PianoRecorder'
import { PLAYBACK_SPEEDS, PianoSequencePlayer } from './PianoSequencePlayer'
import type { PlaybackSpeed } from './PianoSequencePlayer'

export type PianoRecordingController = {
  isRecording: boolean
  isPlaying: boolean
  notes: RecordedPianoNote[]
  playbackSpeed: PlaybackSpeed
  onNoteStart: (midi: number) => void
  onNoteEnd: (midi: number) => void
  startRecording: () => void
  stopRecording: () => void
  setPlaybackSpeed: (speed: PlaybackSpeed) => void
  replay: () => void
  stopPlayback: () => void
}

export function usePianoRecording(engine: PianoAudioEngine): PianoRecordingController {
  const recorder = useMemo(() => new PianoRecorder(), [])
  const player = useMemo(() => new PianoSequencePlayer(engine), [engine])
  const playbackGeneration = useRef(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [notes, setNotes] = useState<RecordedPianoNote[]>([])
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1)

  const onNoteStart = useCallback((midi: number) => {
    recorder.noteOn(midi)
  }, [recorder])

  const onNoteEnd = useCallback((midi: number) => {
    recorder.noteOff(midi)
  }, [recorder])

  const stopPlayback = useCallback(() => {
    playbackGeneration.current += 1
    player.stop()
    setIsPlaying(false)
  }, [player])

  const startRecording = useCallback(() => {
    stopPlayback()
    recorder.start()
    setNotes([])
    setIsRecording(true)
  }, [recorder, stopPlayback])

  const stopRecording = useCallback(() => {
    setNotes(recorder.stop())
    setIsRecording(false)
  }, [recorder])

  const updatePlaybackSpeed = useCallback((speed: PlaybackSpeed) => {
    if (PLAYBACK_SPEEDS.includes(speed)) setPlaybackSpeed(speed)
  }, [])

  const replay = useCallback(() => {
    if (isRecording || notes.length === 0) return
    const generation = ++playbackGeneration.current
    setIsPlaying(true)
    const finishPlayback = () => {
      if (playbackGeneration.current === generation) setIsPlaying(false)
    }
    void player.play(notes, playbackSpeed).then(finishPlayback, finishPlayback)
  }, [isRecording, notes, playbackSpeed, player])

  useEffect(() => () => {
    playbackGeneration.current += 1
    player.stop()
    recorder.stop()
  }, [player, recorder])

  return {
    isRecording,
    isPlaying,
    notes,
    playbackSpeed,
    onNoteStart,
    onNoteEnd,
    startRecording,
    stopRecording,
    setPlaybackSpeed: updatePlaybackSpeed,
    replay,
    stopPlayback,
  }
}
