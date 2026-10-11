/**
 * Exercise 2 — Reactive State Machine & Delegation Hub
 * A minimal positional hook engine (no React or external state library).
 */

// Hook slot i belongs to the i-th useState call in every render.
export const stateStore = [];
let cursor = 0;
let renderer = null;
let isRendering = false;
let renderQueued = false;
let expectedHookCount = null;

/** Reset the hook position, but preserve all existing state values. */
export function resetCursor() {
  cursor = 0;
}

/**
 * Register the application render callback and run a render pass.
 * Later calls with no argument re-render using the registered callback.
 * Always call hooks in the same order, at the top level of the renderer.
 */
export function renderApp(nextRenderer) {
  if (nextRenderer !== undefined) {
    if (typeof nextRenderer !== 'function') {
      throw new TypeError('renderApp expects a render function.');
    }
    renderer = nextRenderer;
    expectedHookCount = null;
  }

  if (renderer === null) {
    throw new Error('Register a render function with renderApp(renderer) first.');
  }

  if (isRendering) {
    renderQueued = true;
    return;
  }

  do {
    renderQueued = false;
    resetCursor();
    isRendering = true;
    try {
      renderer();
      if (expectedHookCount !== null && cursor !== expectedHookCount) {
        throw new Error('Hook order/count changed between renders.');
      }
      expectedHookCount = cursor;
    } finally {
      isRendering = false;
    }
  } while (renderQueued);
}

/** Return the value at this hook position and its stable slot setter. */
export function useState(initialValue) {
  if (!isRendering) {
    throw new Error('useState must be called during renderApp().');
  }

  const hookIndex = cursor++;
  if (!Object.prototype.hasOwnProperty.call(stateStore, hookIndex)) {
    stateStore[hookIndex] = typeof initialValue === 'function'
      ? initialValue()
      : initialValue;
  }

  const setState = (update) => {
    const previous = stateStore[hookIndex];
    const next = typeof update === 'function' ? update(previous) : update;
    if (Object.is(previous, next)) return;
    stateStore[hookIndex] = next;
    renderApp();
  };

  return [stateStore[hookIndex], setState];
}
