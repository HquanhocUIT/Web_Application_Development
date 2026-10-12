export function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <section className="error-panel" role="alert" aria-labelledby="error-title">
      <span className="error-icon" aria-hidden="true">!</span>
      <span className="eyebrow">CONNECTION INTERRUPTED</span>
      <h3 id="error-title">Unable to load your feed.</h3>
      <p>{error}</p>
      <button className="primary-button" type="button" onClick={onRetry}><span aria-hidden="true">↻</span> Retry Connection</button>
      <small>Check your connection and try again.</small>
    </section>
  );
}
