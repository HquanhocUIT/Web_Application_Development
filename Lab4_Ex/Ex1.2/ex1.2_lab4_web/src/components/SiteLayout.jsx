import { Suspense } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'

export function SiteLayout() {
  const { pathname } = useLocation()
  const isPeopleDetailRoute = /^\/people\/[^/]+\/?$/.test(pathname)

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <NavLink className="brand" to="/" end>
          People Directory
        </NavLink>
        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            to="/"
            end
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            to="/people"
          >
            People
          </NavLink>
        </nav>
      </header>

      <main
        className="main-content"
        data-people-detail={isPeopleDetailRoute ? 'true' : undefined}
        id="main-content"
        tabIndex={-1}
      >
        <Suspense
          fallback={
            <p className="loading-fallback" role="status" aria-live="polite">
              Loading page...
            </p>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <footer className="site-footer">A simple directory for getting to know the team.</footer>
    </>
  )
}
