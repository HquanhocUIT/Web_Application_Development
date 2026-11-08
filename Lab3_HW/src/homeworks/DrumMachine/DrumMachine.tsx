import DrumPad from '../../components/DrumPad'
import { DRUM_PADS } from './drumPads'
import styles from './DrumMachine.module.css'

export default function DrumMachine() {
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
            {DRUM_PADS.map((pad) => <DrumPad key={pad.key} pad={pad} />)}
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
