import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchFeed } from '../services/api';
import { transition, type ViewState } from '../types/state';
import type { FeedItem, FetchMode } from '../types/feed';

/** Only the most recent, still-mounted request may update the view. */
export function useDataLoader() {
  const [view, setView] = useState<ViewState<FeedItem[]>>({ status: 'IDLE' });
  const [mode, setMode] = useState<FetchMode>('success');
  const requestId = useRef(0);
  const activeController = useRef<AbortController | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Invalidate results even if the underlying API ignores AbortSignal.
      requestId.current += 1;
      activeController.current?.abort();
      activeController.current = null;
    };
  }, []);

  const load = useCallback(async (selectedMode: FetchMode = mode): Promise<void> => {
    // Ignore calls after unmount rather than launching a request that cannot render.
    if (!mounted.current) return;

    // Invalidate and cancel the previous request BEFORE starting the new one.
    const id = ++requestId.current;
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    setView(previous => transition(previous, { type: 'FETCH' }));

    const isCurrent = () =>
      mounted.current && requestId.current === id &&
      activeController.current === controller && !controller.signal.aborted;

    try {
      const data = await fetchFeed(selectedMode, controller.signal);
      if (isCurrent()) {
        setView(previous => transition(previous, { type: 'RESOLVE', data }));
      }
    } catch (error: unknown) {
      // Cancellation is intentional, never a user-facing connection error.
      if (isCurrent() && !(error instanceof Error && error.name === 'AbortError')) {
        const message = error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';
        setView(previous => transition(previous, { type: 'REJECT', error: message }));
      }
    } finally {
      if (requestId.current === id && activeController.current === controller) {
        activeController.current = null;
      }
    }
  }, [mode]);

  return { view, mode, setMode, load };
}
