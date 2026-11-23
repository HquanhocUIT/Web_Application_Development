import { useCallback, useState } from 'react'
import SimpleForm from './components/SimpleForm.jsx'

function App() {
  const [parentValues, setParentValues] = useState({ name: '', email: '', password: '' })
  const handleValuesChange = useCallback((nextValues) => {
    setParentValues(nextValues)
  }, [])

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#main-content">Legacy Validation Lab</a>
        <span className="header-note">React effects demonstration</span>
      </header>

      <main className="main-content" id="main-content">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Exercise 1.3 · Architecture lab</p>
          <h1 id="page-title">Legacy Validation Anti-Pattern</h1>
          <p>
            Follow five connected effects as form state, validation, child errors, and scrolling
            update in sequence. Open the browser console to see each render and effect.
          </p>
        </section>

        <div className="lab-grid">
          <SimpleForm onValuesChange={handleValuesChange} />

          <aside className="side-column" aria-label="Legacy pattern observations">
            <section className="observation-card" aria-labelledby="sync-title">
              <p className="card-kicker">Effect 1 · child → parent</p>
              <h2 id="sync-title">Parent snapshot</h2>
              <p className="card-description">The form copies its input state to this component.</p>
              <dl className="snapshot-list">
                <div><dt>Name</dt><dd>{parentValues.name || '—'}</dd></div>
                <div><dt>Email</dt><dd>{parentValues.email || '—'}</dd></div>
                <div><dt>Password</dt><dd>{parentValues.password ? '••••••••' : '—'}</dd></div>
              </dl>
            </section>

          </aside>
        </div>
      </main>

      <footer className="site-footer">Legacy architecture study · No external form libraries</footer>
    </div>
  )
}

export default App
