import { describe, expect, it } from 'vitest';
import { transition, type FeedEvent, type ViewState } from '../src/types/state';

describe('finite ViewState machine', () => {
  const idle: ViewState<string[]> = { status: 'IDLE' };
  const loading: ViewState<string[]> = { status: 'LOADING' };
  const success: ViewState<string[]> = { status: 'SUCCESS', data: ['item'] };
  const error: ViewState<string[]> = { status: 'ERROR', error: 'offline' };

  it('follows IDLE → LOADING → SUCCESS without stale fields', () => {
    expect(transition(idle, { type: 'FETCH' })).toEqual(loading);
    expect(transition(loading, { type: 'RESOLVE', data: ['item'] })).toEqual(success);
    expect(transition(success, { type: 'FETCH' })).toEqual(loading);
  });

  it('follows LOADING → ERROR → RETRY → LOADING', () => {
    expect(transition(loading, { type: 'REJECT', error: 'offline' })).toEqual(error);
    expect(transition(error, { type: 'RETRY' })).toEqual(loading);
  });

  it('rejects completion events outside LOADING', () => {
    const events: FeedEvent<string[]>[] = [
      { type: 'RESOLVE', data: ['late'] },
      { type: 'REJECT', error: 'late error' },
    ];
    for (const state of [idle, success, error]) {
      for (const event of events) expect(transition(state, event)).toBe(state);
    }
  });

  it('ignores RETRY unless the view is ERROR', () => {
    for (const state of [idle, loading, success]) {
      expect(transition(state, { type: 'RETRY' })).toBe(state);
    }
  });

  it('allows new FETCH to replace an in-flight request and clears old data/error', () => {
    expect(transition(loading, { type: 'FETCH' })).toEqual(loading);
    expect(transition(error, { type: 'FETCH' })).toEqual(loading);
    expect(transition(success, { type: 'FETCH' })).toEqual(loading);
  });

  it('provides a useful error if rejection message is blank', () => {
    expect(transition(loading, { type: 'REJECT', error: '  ' })).toEqual({
      status: 'ERROR',
      error: 'Unable to load data. Please try again.',
    });
  });

  it('does not mutate previous state', () => {
    const before = Object.freeze({ status: 'SUCCESS' as const, data: Object.freeze(['item']) });
    const next = transition(before, { type: 'FETCH' });
    expect(next).toEqual(loading);
    expect(before.data).toEqual(['item']);
  });
});

describe('required end-to-end state transition sequences', () => {
  it('completes IDLE → LOADING → SUCCESS with exactly one active view', () => {
    let state: ViewState<number[]> = { status: 'IDLE' };
    state = transition(state, { type: 'FETCH' });
    expect(state).toEqual({ status: 'LOADING' });
    state = transition(state, { type: 'RESOLVE', data: [1, 2] });
    expect(state).toEqual({ status: 'SUCCESS', data: [1, 2] });
    expect(Object.keys(state).sort()).toEqual(['data', 'status']);
  });

  it('completes IDLE → LOADING → ERROR → LOADING → SUCCESS', () => {
    let state: ViewState<number[]> = { status: 'IDLE' };
    state = transition(state, { type: 'FETCH' });
    state = transition(state, { type: 'REJECT', error: 'Network unavailable' });
    expect(state).toEqual({ status: 'ERROR', error: 'Network unavailable' });
    state = transition(state, { type: 'RETRY' });
    expect(state).toEqual({ status: 'LOADING' });
    state = transition(state, { type: 'RESOLVE', data: [42] });
    expect(state).toEqual({ status: 'SUCCESS', data: [42] });
  });

  it('handles repeated failures and retries without carrying stale fields', () => {
    let state: ViewState<number[]> = { status: 'IDLE' };
    state = transition(state, { type: 'FETCH' });
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      state = transition(state, { type: 'REJECT', error: `Failure ${attempt}` });
      expect(state).toEqual({ status: 'ERROR', error: `Failure ${attempt}` });
      state = transition(state, { type: 'RETRY' });
      expect(state).toEqual({ status: 'LOADING' });
    }
    state = transition(state, { type: 'RESOLVE', data: [5] });
    expect(state).toEqual({ status: 'SUCCESS', data: [5] });
  });
});
