import { Link } from 'react-router-dom'
import styles from './ChampionshipHeader.module.css'

export default function ChampionshipHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} to="/">
        <span className={styles.brandMark} aria-hidden="true">P</span>
        <span className={styles.brandText}>KRAFTON <i>×</i> PUBG VIETNAM</span>
      </Link>
      <nav className={styles.nav} aria-label="Championship sections">
        <a href="#airdrop">Airdrop arena</a>
        <a href="#rewards">Rewards</a>
        <a href="#leaderboard">Leaderboard</a>
      </nav>
      <span className={styles.eventBadge}><span aria-hidden="true" /> CHAMPIONSHIP SERIES</span>
    </header>
  )
}
