import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { useDataLoader } from '../src/hooks/useDataLoader';
import { fetchFeed } from '../src/services/api';
import type { FeedItem } from '../src/types/feed';

vi.mock('../src/services/api', () => ({ fetchFeed: vi.fn() }));
const mockedFetch = vi.mocked(fetchFeed);
const items: FeedItem[] = [{ id: '1', title: 'Test', summary: 'Body', category: 'News', author: 'A', date: 'Today', readTime: '1 min' }];
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe('resilient async data fetching', () => {
  it('moves IDLE → LOADING → SUCCESS', async () => {
    const pending = deferred<FeedItem[]>();
    mockedFetch.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useDataLoader());
    expect(result.current.view.status).toBe('IDLE');
    let action!: Promise<void>;
    act(() => { action = result.current.load(); });
    expect(result.current.view.status).toBe('LOADING');
    await act(async () => { pending.resolve(items); await action; });
    expect(result.current.view).toEqual({ status: 'SUCCESS', data: items });
  });

  it('moves LOADING → ERROR on rejection and allows retry', async () => {
    const first = deferred<FeedItem[]>();
    mockedFetch.mockReturnValueOnce(first.promise).mockResolvedValueOnce(items);
    const { result } = renderHook(() => useDataLoader());
    let action!: Promise<void>;
    act(() => { action = result.current.load(); });
    await act(async () => { first.reject(new Error('Offline')); await action; });
    expect(result.current.view).toEqual({ status: 'ERROR', error: 'Offline' });
    await act(async () => { await result.current.load(); });
    expect(result.current.view.status).toBe('SUCCESS');
  });

  it('aborts stale request and ignores late success even when fetch ignores abort', async () => {
    const old = deferred<FeedItem[]>();
    const newest = deferred<FeedItem[]>();
    mockedFetch.mockReturnValueOnce(old.promise).mockReturnValueOnce(newest.promise);
    const { result } = renderHook(() => useDataLoader());
    let oldAction!: Promise<void>;
    let newAction!: Promise<void>;
    act(() => { oldAction = result.current.load(); });
    const oldSignal = mockedFetch.mock.calls[0][1];
    act(() => { newAction = result.current.load(); });
    expect(oldSignal.aborted).toBe(true);
    await act(async () => { newest.resolve(items); await newAction; });
    await act(async () => { old.resolve([]); await oldAction; });
    expect(result.current.view).toEqual({ status: 'SUCCESS', data: items });
  });

  it('ignores late rejection and does not update after unmount', async () => {
    const old = deferred<FeedItem[]>();
    mockedFetch.mockReturnValueOnce(old.promise);
    const { result, unmount } = renderHook(() => useDataLoader());
    let action!: Promise<void>;
    act(() => { action = result.current.load(); });
    const signal = mockedFetch.mock.calls[0][1];
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => { old.reject(new Error('Late failure')); await action; });
    await act(async () => { await result.current.load(); });
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });
});
