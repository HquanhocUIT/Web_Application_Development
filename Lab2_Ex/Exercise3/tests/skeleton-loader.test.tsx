import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SkeletonLoader } from '../src/components/SkeletonLoader';

// App.tsx gates this component behind view.status === 'LOADING'.
describe('SkeletonLoader', () => {
  it('renders four placeholder cards matching the feed layout', () => {
    const html = renderToStaticMarkup(<SkeletonLoader />);
    expect((html.match(/skeleton-card/g) ?? [])).toHaveLength(4);
    expect((html.match(/skeleton-avatar/g) ?? [])).toHaveLength(4);
    expect(html).toContain('skeleton-headline');
    expect(html).toContain('skeleton-copy');
  });

  it('announces loading and hides decorative placeholders from assistive technology', () => {
    const html = renderToStaticMarkup(<SkeletonLoader />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('Loading stories, please wait.');
  });
});
