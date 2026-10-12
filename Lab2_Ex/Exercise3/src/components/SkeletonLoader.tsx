/** A visual stand-in for the feed cards while the active request is loading. */
export function SkeletonLoader() {
  return (
    <div className="skeleton-loading" role="status" aria-label="Loading feed items" aria-busy="true">
      <ul className="feed-grid skeleton-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <li className="feed-card skeleton-card" key={index}>
            <div className="skeleton-upper">
              <span className="skeleton-line skeleton-tag" />
              <span className="skeleton-line skeleton-number" />
            </div>
            <div className="skeleton-headline">
              <span className="skeleton-line skeleton-title" />
              <span className="skeleton-line skeleton-title short" />
            </div>
            <div className="skeleton-copy">
              <span className="skeleton-line skeleton-description" />
              <span className="skeleton-line skeleton-description short" />
            </div>
            <div className="skeleton-footer">
              <span className="skeleton-line skeleton-avatar" />
              <div className="skeleton-author">
                <span className="skeleton-line skeleton-byline" />
                <span className="skeleton-line skeleton-meta" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <span className="sr-only">Loading stories, please wait.</span>
    </div>
  );
}
