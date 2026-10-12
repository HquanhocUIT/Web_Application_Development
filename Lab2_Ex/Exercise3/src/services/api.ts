import type { FeedItem, FetchMode } from '../types/feed';

const ITEMS: readonly FeedItem[] = [
  { id: '1', title: 'Building interfaces that feel effortless', summary: 'A practical look at small design decisions that make digital products calmer, clearer, and easier to navigate.', category: 'Design', author: 'Maya Chen', date: 'Oct 12, 2026', readTime: '6 min read' },
  { id: '2', title: 'The art of resilient frontend systems', summary: 'How predictable states, thoughtful fallbacks, and simple contracts make applications more dependable.', category: 'Engineering', author: 'Alex Morgan', date: 'Oct 10, 2026', readTime: '8 min read' },
  { id: '3', title: 'Turning customer signals into product insights', summary: 'Finding patterns in feedback without losing sight of the real people behind the numbers.', category: 'Product', author: 'Jordan Lee', date: 'Oct 08, 2026', readTime: '5 min read' },
  { id: '4', title: 'What makes a useful loading experience?', summary: 'From skeleton screens to microcopy: communicating progress when network conditions are uncertain.', category: 'Research', author: 'Sam Rivera', date: 'Oct 06, 2026', readTime: '4 min read' },
];

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException('Request aborted', 'AbortError')); return; }
    const timeoutId = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve(); }, ms);
    function cancel() { clearTimeout(timeoutId); signal.removeEventListener('abort', cancel); reject(new DOMException('Request aborted', 'AbortError')); }
    signal.addEventListener('abort', cancel, { once: true });
  });
}

/** Simulated API. Abort cancellation works during its artificial latency. */
export async function fetchFeed(mode: FetchMode, signal: AbortSignal): Promise<FeedItem[]> {
  await delay(1300, signal);
  if (signal.aborted) throw new DOMException('Request aborted', 'AbortError');
  if (mode === 'failure' || (mode === 'random' && Math.random() < 0.4)) {
    throw new Error('We couldn’t connect to the feed. Check your connection and try again.');
  }
  return ITEMS.map(item => ({ ...item }));
}
