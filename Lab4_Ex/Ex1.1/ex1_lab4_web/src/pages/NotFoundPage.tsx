import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <section className="empty-state" aria-labelledby="not-found-title">
      <p className="eyebrow">Page not found</p>
      <h1 className="page-title" id="not-found-title">
        We couldn&apos;t find that page.
      </h1>
      <p className="page-intro">Use the links above to return to the directory.</p>
      <Link className="text-link" to="/">
        Go to Home
      </Link>
    </section>
  )
}

export default NotFoundPage
