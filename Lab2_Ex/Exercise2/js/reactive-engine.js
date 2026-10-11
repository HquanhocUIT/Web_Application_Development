/**
 * Exercise 2 — Reactive State Machine & Delegation Hub
 *
 * Hook storage foundation. State values are retained between render passes;
 * only the hook cursor is reset at the start of each pass.
 */

// Each index corresponds to the same hook call position across renders.
export const stateStore = [];

// Index of the next hook to be read during the current render pass.
let cursor = 0;

/**
 * Begin a new render pass without discarding previously stored state.
 * Call once before invoking the application render function.
 */
export function resetCursor() {
  cursor = 0;
}

// The custom useState dispatcher will consume and advance cursor
// in the next milestone. Do not clear stateStore during a re-render.
