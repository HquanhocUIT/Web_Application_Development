import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import DrumPad from '../../components/DrumPad'
import { DRUM_PADS } from './drumPads'
import { DrumAudioEngine } from './drumAudio'
import styles from './DrumMachine.module.css'

type DrumHit = {
  id: number
  key: string
  name: string
  time: string
  dateTime: string
}

const MAX_HISTORY = 8

export default function DrumMachine() {
  const audioEngineRef = useRef<DrumAudioEngine | null>(null)
  const activeHitTimerRef = useRef<number | null>(null)
  const nextHitIdRef = useRef(0)
  const padRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const [focusedPadIndex, setFocusedPadIndex] = useState(0)
  const [history, setHistory] = useState<DrumHit[]>([])

  const playPad = useCallback((pad: (typeof DRUM_PADS)[number]) => {
    audioEngineRef.current ??= new DrumAudioEngine()
    audioEngineRef.current.play(pad)

    setPressedKey(pad.key)
    const now = new Date()
    setHistory((currentHistory) => [
      {
        id: nextHitIdRef.current++,
        key: pad.key,
        name: pad.name,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        dateTime: now.toISOString(),
      },
      ...currentHistory,
    ].slice(0, MAX_HISTORY))

    if (activeHitTimerRef.current !== null) {
      window.clearTimeout(activeHitTimerRef.current)
    }
    activeHitTimerRef.current = window.setTimeout(() => {
      setPressedKey(null)
      activeHitTimerRef.current = null
    }, 190)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || isTypingTarget(event.target)) return

      const pad = DRUM_PADS.find(({ key }) => event.code === `Key${key}`)
      if (pad) playPad(pad)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (activeHitTimerRef.current !== null) {
        window.clearTimeout(activeHitTimerRef.current)
        activeHitTimerRef.current = null
      }
      audioEngineRef.current?.dispose()
      audioEngineRef.current = null
    }
  }, [playPad])

  function handlePadNavigation(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | null = null
    const columns = window.innerWidth <= 480 ? 2 : window.innerWidth <= 720 ? 3 : 4
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % DRUM_PADS.length
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + DRUM_PADS.length) % DRUM_PADS.length
    if (event.key === 'ArrowDown') {
      nextIndex = currentIndex + columns < DRUM_PADS.length ? currentIndex + columns : currentIndex
    }
    if (event.key === 'ArrowUp') {
      nextIndex = currentIndex - columns >= 0 ? currentIndex - columns : currentIndex
    }
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = DRUM_PADS.length - 1
    if (nextIndex === null) return

    event.preventDefault()
    setFocusedPadIndex(nextIndex)
    padRefs.current[nextIndex]?.focus()
  }

  return (
    <main className={styles.page}>
      <section className={styles.studio} aria-labelledby="studio-title">
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">●</span>
            <span>STUDIO SESSION <span className={styles.brandDivider}>/</span> 001</span>
          </div>
          <span className={styles.status}><span className={styles.statusDot} /> DRUM MACHINE</span>
        </header>

        <div className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>PRODUCTION STUDIO</p>
            <h1 id="studio-title">Find your <span>rhythm.</span></h1>
            <p className={styles.description}>A little pocket kit for the next big idea.</p>
          </div>
          <div className={styles.sessionBadge} aria-hidden="true">
            <span className={styles.sessionNumber}>07</span>
            <span className={styles.sessionCaption}>SOUND<br />PADS</span>
          </div>
        </div>

        <div className={styles.padSection}>
          <div className={styles.sectionHeading}>
            <h2>THE KIT</h2>
            <span>CHOOSE A PAD</span>
          </div>
          <div className={styles.padGrid} role="group" aria-label="Drum pads">
            {DRUM_PADS.map((pad, index) => (
              <DrumPad
                key={pad.key}
                pad={pad}
                onPlay={playPad}
                pressed={pressedKey === pad.key}
                tabIndex={focusedPadIndex === index ? 0 : -1}
                buttonRef={(element) => { padRefs.current[index] = element }}
                onFocus={() => setFocusedPadIndex(index)}
                onKeyDown={(event) => handlePadNavigation(event, index)}
              />
            ))}
          </div>
          <p className={styles.keyboardHint}>
            <span className={styles.playKeys}>
              Play with <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd>
            </span>
            <span>Use arrow keys to move focus between pads.</span>
          </p>
        </div>

        <div className={styles.sessionTools}>
          <section className={styles.historyPanel} aria-labelledby="history-title">
            <div className={styles.toolHeading}>
              <h2 id="history-title">RECENT HITS</h2>
              <span>{history.length.toString().padStart(2, '0')} / {MAX_HISTORY.toString().padStart(2, '0')}</span>
            </div>
            <div
              className={styles.historyLog}
              role="log"
              aria-label="Recent drum hits"
              aria-live="polite"
              aria-relevant="additions"
              aria-atomic="false"
            >
              {history.length === 0 ? (
                <p className={styles.emptyHistory}>Your hits will appear here.</p>
              ) : (
                <ol className={styles.hitList}>
                  {history.map((hit) => (
                    <li className={styles.hit} key={hit.id}>
                      <span className={styles.hitKey}>{hit.key}</span>
                      <span className={styles.hitName}>{hit.name}</span>
                      <time className={styles.hitTime} dateTime={hit.dateTime}>{hit.time}</time>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>

          <OutputMeter audioEngineRef={audioEngineRef} />
        </div>

        <footer className={styles.footer}>
          <span><span className={styles.footerDot} /> SESSION READY</span>
          <span>7 PADS <span className={styles.footerDivider}>·</span> 1 BEAT AT A TIME</span>
        </footer>
      </section>
    </main>
  )
}

function OutputMeter({ audioEngineRef }: { audioEngineRef: { current: DrumAudioEngine | null } }) {
  const [decibels, setDecibels] = useState(-60)

  useEffect(() => {
    const meterTimerId = window.setInterval(() => {
      const nextDecibels = audioEngineRef.current?.getDecibels() ?? -60
      setDecibels((currentDecibels) => currentDecibels === nextDecibels ? currentDecibels : nextDecibels)
    }, 100)
    return () => window.clearInterval(meterTimerId)
  }, [audioEngineRef])

  return (
    <section className={styles.meterPanel} aria-labelledby="meter-title">
      <div className={styles.toolHeading}>
        <h2 id="meter-title">OUTPUT LEVEL</h2>
        <output className={styles.meterValue}>{Math.round(decibels)} dBFS</output>
      </div>
      <meter
        className={styles.meter}
        min={-60}
        max={0}
        low={-36}
        high={-6}
        optimum={-12}
        value={decibels}
        aria-label="Output level in decibels"
        aria-valuetext={`${Math.round(decibels)} dBFS`}
      />
      <p className={styles.meterScale} aria-hidden="true"><span>-60 dB</span><span>0 dB</span></p>
    </section>
  )
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement
    && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null
}
