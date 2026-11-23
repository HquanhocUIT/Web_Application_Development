import { Link } from 'react-router'

function HomePage() {
  return (
    <section aria-labelledby="home-title">
      <p className="eyebrow">Welcome</p>
      <h1 className="page-title" id="home-title">
        Meet the people behind the work.
      </h1>
      <p className="page-intro">
        Browse the team directory to find a colleague, learn what they do, and see where they work.
      </p>
      <Link className="button-link" to="/people">
        Explore the people list <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}

export default HomePage
