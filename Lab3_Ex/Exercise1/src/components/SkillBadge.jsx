import styles from './DeveloperCard.module.css'

function SkillBadge({ skill }) {
  return (
    <li className={styles.skillBadge}>
      <span className={styles.skillName}>{skill.name}</span>
      <span className={styles.skillLevel}>{skill.level}</span>
    </li>
  )
}

export default SkillBadge
