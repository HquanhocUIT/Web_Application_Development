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
