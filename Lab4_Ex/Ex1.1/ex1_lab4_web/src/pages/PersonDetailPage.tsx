import { Link, useParams } from 'react-router'
import { people } from '../data/people'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
}

function PersonDetailPage() {
  const { personId } = useParams()
  const person = people.find((item) => item.id === personId)

  if (!person) {
    return (
      <section className="empty-state" aria-labelledby="missing-person-title">
        <p className="eyebrow">Directory</p>
        <h1 className="page-title" id="missing-person-title">
          Person not found
        </h1>
        <p className="page-intro">This person is not in the directory.</p>
        <Link className="text-link" to="/people">
          Back to People
        </Link>
      </section>
    )
  }

  return (
    <article className="detail-panel" aria-labelledby="person-title">
      <p className="eyebrow">Person details</p>
      <header className="detail-heading">
        <span className="person-initials" aria-hidden="true">
          {getInitials(person.name)}
        </span>
        <div>
          <h1 className="page-title" id="person-title">
            {person.name}
          </h1>
          <p className="detail-role">{person.role}</p>
        </div>
      </header>

      <p className="person-bio">{person.bio}</p>

      <dl className="person-details">
        <div>
          <dt>Department</dt>
          <dd>{person.department}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{person.location}</dd>
        </div>
        <div>
          <dt>Joined</dt>
          <dd>
            <time dateTime={person.joined}>{person.joined}</time>
          </dd>
        </div>
      </dl>

      <Link className="text-link" to="/people">
        ← Back to People
      </Link>
    </article>
  )
}

export default PersonDetailPage
