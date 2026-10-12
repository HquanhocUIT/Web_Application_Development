/** Exactly one view phase can be active at a time. */
export type ViewState<T> =
  | { status: 'IDLE'; data?: never; error?: never }
  | { status: 'LOADING'; data?: never; error?: never }
  | { status: 'SUCCESS'; data: T; error?: never }
  | { status: 'ERROR'; error: string; data?: never };

export type FeedEvent<T> =
  | { type: 'FETCH' }
  | { type: 'RETRY' }
  | { type: 'RESOLVE'; data: T }
  | { type: 'REJECT'; error: string };

/**
 * Finite-state transition function used by React useState's functional setter.
 * Unknown/stale completion events are ignored instead of corrupting the view.
 * FETCH also supports a fresh request while already loading (latest request wins
 * in useDataLoader) and refreshes after SUCCESS or ERROR.
 */
export function transition<T>(state: ViewState<T>, event: FeedEvent<T>): ViewState<T> {
  switch (event.type) {
    case 'FETCH':
      return { status: 'LOADING' };
    case 'RETRY':
      return state.status === 'ERROR' ? { status: 'LOADING' } : state;
    case 'RESOLVE':
      return state.status === 'LOADING'
        ? { status: 'SUCCESS', data: event.data }
        : state;
    case 'REJECT':
      return state.status === 'LOADING'
        ? { status: 'ERROR', error: event.error.trim() || 'Unable to load data. Please try again.' }
        : state;
  }
}
