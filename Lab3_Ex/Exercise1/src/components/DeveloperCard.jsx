import { Fragment, useId, useState } from 'react'
import SkillBadge from './SkillBadge.jsx'
import styles from './DeveloperCard.module.css'

function getInitials(fullName) {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  )
}

function getSecureAvatarUrl(avatarUrl) {
  if (typeof avatarUrl !== 'string' || avatarUrl.trim() === '') {
    return null
  }

  try {
    const parsedUrl = new URL(avatarUrl)
    return parsedUrl.protocol === 'https:' ? parsedUrl.href : null
  } catch {
    return null
  }
}

function DeveloperCard({
  fullName = 'Alex Morgan',
  role = 'Software Developer & Pro Gamer',
  avatarUrl = null,
  metrics = {},
  skills = [],
} = {}) {
  const titleId = useId()
  const [avatarFailed, setAvatarFailed] = useState(false)
  const safeAvatarUrl = getSecureAvatarUrl(avatarUrl)
  const showAvatar = safeAvatarUrl && !avatarFailed

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <header className={styles.header}>
        {showAvatar ? (
          <img
            className={styles.avatar}
            src={safeAvatarUrl}
            alt={fullName}
            width={96}
            height={96}
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <span
            className={styles.avatarFallback}
            role="img"
            aria-label={`${fullName} initials`}
          >
            {getInitials(fullName)}
          </span>
        )}

        <hgroup className={styles.identity}>
          <h2 className={styles.title} id={titleId}>
            {fullName}
          </h2>
          <p className={styles.role}>{role}</p>
        </hgroup>
      </header>

      <dl className={styles.metrics}>
        {Object.entries(metrics).map(([label, value]) => (
          <Fragment key={label}>
            <dt className={styles.metricTerm}>{label}</dt>
            <dd className={styles.metricValue}>{value}</dd>
          </Fragment>
        ))}
      </dl>

      <ul className={styles.skillList} aria-label="Skills">
        {skills.map((skill) => (
          <SkillBadge key={skill.id} skill={skill} />
        ))}
      </ul>
    </article>
  )
}

export default DeveloperCard
