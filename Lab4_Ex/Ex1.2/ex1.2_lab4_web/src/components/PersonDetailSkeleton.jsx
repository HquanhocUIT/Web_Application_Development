export function PersonDetailSkeleton() {
  return (
    <div
      className="detail-panel person-detail-skeleton"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading person details"
    >
      <p className="eyebrow">
        <span className="skeleton-block skeleton-eyebrow" aria-hidden="true" />
      </p>

      <header className="detail-heading">
        <span className="person-initials skeleton-avatar" aria-hidden="true" />
        <div className="detail-heading-copy" aria-hidden="true">
          <span className="skeleton-block skeleton-person-name" />
          <span className="detail-role skeleton-role">
            <span className="skeleton-block skeleton-role-text" />
          </span>
        </div>
      </header>

      <p className="person-bio person-bio-skeleton" aria-hidden="true">
        <span className="skeleton-copy-line skeleton-copy-line-long" />
        <span className="skeleton-copy-line skeleton-copy-line-medium" />
        <span className="skeleton-copy-line skeleton-copy-line-short" />
        <span className="skeleton-copy-line skeleton-copy-line-last" />
      </p>

      <dl className="person-details" aria-hidden="true">
        <div>
          <dt><span className="skeleton-block skeleton-label" /></dt>
          <dd><span className="skeleton-block skeleton-value skeleton-value-short" /></dd>
        </div>
        <div>
          <dt><span className="skeleton-block skeleton-label" /></dt>
          <dd><span className="skeleton-block skeleton-value skeleton-value-long" /></dd>
        </div>
        <div>
          <dt><span className="skeleton-block skeleton-label" /></dt>
          <dd><span className="skeleton-block skeleton-value skeleton-value-medium" /></dd>
        </div>
        <div>
          <dt><span className="skeleton-block skeleton-label" /></dt>
          <dd><span className="skeleton-block skeleton-value skeleton-value-short" /></dd>
        </div>
      </dl>

      <span className="skeleton-block skeleton-back-link" aria-hidden="true" />
    </div>
  )
}
