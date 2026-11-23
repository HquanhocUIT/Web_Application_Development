import { Link } from 'react-router'

export function NotFoundState() {
  return (
    <section className="empty-state" aria-labelledby="missing-person-title">
      <p className="eyebrow">Directory</p>
      <h2 className="page-title" id="missing-person-title">
        Person not found
      </h2>
      <p className="page-intro">This person is not in the directory.</p>
      <Link className="text-link" to="/people">
        Back to People
      </Link>
    </section>
  )
}
