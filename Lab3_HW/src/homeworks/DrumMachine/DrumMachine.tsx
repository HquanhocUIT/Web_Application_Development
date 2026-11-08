import { useCallback, useEffect, useRef } from 'react'
import DrumPad from '../../components/DrumPad'
import { DRUM_PADS } from './drumPads'
import { DrumAudioEngine } from './drumAudio'
import styles from './DrumMachine.module.css'

export default function DrumMachine() {
  const audioEngineRef = useRef<DrumAudioEngine | null>(null)

  const playPad = useCallback((pad: (typeof DRUM_PADS)[number]) => {
    audioEngineRef.current ??= new DrumAudioEngine()
    audioEngineRef.current.play(pad)
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
      audioEngineRef.current?.dispose()
      audioEngineRef.current = null
    }
  }, [playPad])

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
          <div className={styles.padGrid}>
            {DRUM_PADS.map((pad) => <DrumPad key={pad.key} pad={pad} onPlay={playPad} />)}
          </div>
        </div>

        <footer className={styles.footer}>
          <span><span className={styles.footerDot} /> SESSION READY</span>
          <span>7 PADS <span className={styles.footerDivider}>·</span> 1 BEAT AT A TIME</span>
        </footer>
      </section>
    </main>
  )
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement
    && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null
}
