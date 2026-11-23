import { Link } from 'react-router'
import type { Person } from '../types/Person'

interface PersonCardProps {
  person: Person
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
}

export function PersonCard({ person }: PersonCardProps) {
  return (
    <li className="person-card">
      <Link className="person-link" to={`/people/${person.id}`}>
        <span className="person-initials" aria-hidden="true">
          {getInitials(person.name)}
        </span>
        <span className="person-card-copy">
          <span className="person-name">{person.name}</span>
          <span className="person-role">{person.role}</span>
        </span>
        <span className="person-link-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  )
}
