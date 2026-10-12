import { DataList } from './components/DataList';
import { ErrorState } from './components/ErrorState';
import { SkeletonLoader } from './components/SkeletonLoader';
import { useDataLoader } from './hooks/useDataLoader';
import type { FetchMode } from './types/feed';

export default function App() {
  const { view, mode, setMode, load } = useDataLoader();
  const busy = view.status === 'LOADING';

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#main-content" aria-label="Pulseboard home"><span className="brand-symbol" aria-hidden="true">◈</span><span>pulseboard<span className="brand-dot">.</span></span></a>
          <div className="header-right"><span className="header-label">EXERCISE 03 / REACT + TYPESCRIPT</span><span className="header-avatar" aria-hidden="true">PB</span></div>
        </div>
      </header>
      <main id="main-content" className="main-container">
        <div className="breadcrumb">WORKSPACE <span>/</span> DATA FEED</div>
        <section className="hero" aria-labelledby="page-title">
          <div><div className="section-label"><span className="green-indicator"/> THE CONTENT STREAM</div><h1 id="page-title">Your daily <em>perspective.</em></h1><p className="hero-subtitle">Ideas, stories, and fresh thinking — delivered in one thoughtful feed.</p></div>
          <div className="hero-graphic" aria-hidden="true"><span className="graphic-orbit orbit-one"/><span className="graphic-orbit orbit-two"/><span className="graphic-center">✳</span></div>
        </section>
        <section className="feed-section" aria-labelledby="feed-title">
          <div className="feed-topline"><div><div className="section-label subtle">EXPLORE & DISCOVER</div><h2 id="feed-title">Latest stories <span className="count-pill">{view.status === 'SUCCESS' ? String(view.data.length).padStart(2,'0') : '—'}</span></h2></div><div className={`connection-status ${busy ? 'status-loading' : view.status === 'ERROR' ? 'status-error' : view.status === 'SUCCESS' ? 'status-connected' : ''}`}><span className="status-dot" />{view.status === 'SUCCESS' ? 'Connected' : view.status === 'LOADING' ? 'Connecting' : view.status === 'ERROR' ? 'Offline' : 'Standing by'}</div></div>
          <div className="toolbar"><div className="toolbar-info"><span className="toolbar-icon" aria-hidden="true">⌁</span><div><strong>Connection simulator</strong><small>Choose a scenario to test the state machine</small></div></div><div className="toolbar-controls"><label htmlFor="mode-select" className="sr-only">Connection scenario</label><select id="mode-select" value={mode} onChange={event => setMode(event.target.value as FetchMode)}><option value="success">Successful request</option><option value="failure">Failed request</option><option value="random">Random outcome</option></select><button className="primary-button" type="button" disabled={busy} onClick={() => void load()}>{busy ? 'Loading…' : view.status === 'SUCCESS' ? 'Refresh Feed ↗' : 'Load Feed ↗'}</button></div></div>
          <div className="content-area" aria-live="polite" aria-atomic="false">
            {view.status === 'IDLE' && <section className="empty-panel"><span className="empty-icon" aria-hidden="true">✳</span><span className="eyebrow">ALL SET TO EXPLORE</span><h3>A little inspiration awaits.</h3><p>Your feed is ready when you are. Hit the button to bring in the latest stories.</p><button type="button" className="outline-button" onClick={() => void load()}>Explore the feed <span aria-hidden="true">→</span></button></section>}
            {view.status === 'LOADING' && <SkeletonLoader />}
            {view.status === 'SUCCESS' && <DataList items={view.data} />}
            {view.status === 'ERROR' && <ErrorState error={view.error} onRetry={() => void load()} />}
          </div>
          <div className="feed-bottom"><span>BUILT FOR THE UNEXPECTED.</span><span>STATE <strong>{view.status}</strong> <span className="footer-separator">/</span> REACT STATE MACHINE</span></div>
        </section>
      </main>
      <footer className="site-footer"><span>© 2026 PULSEBOARD LAB</span><span>DESIGNED TO RECOVER GRACEFULLY <span aria-hidden="true">✳</span></span></footer>
    </div>
  );
}
