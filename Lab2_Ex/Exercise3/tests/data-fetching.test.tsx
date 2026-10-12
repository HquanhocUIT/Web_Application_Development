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

  it('ignores duplicate load calls while the same request is in flight', async () => {
    const pending = deferred<FeedItem[]>();
    mockedFetch.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useDataLoader());
    let first!: Promise<void>;
    act(() => { first = result.current.load(); void result.current.load(); });
    expect(result.current.view.status).toBe('LOADING');
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    await act(async () => { pending.resolve(items); await first; });
    expect(result.current.view.status).toBe('SUCCESS');
  });

  it('prevents duplicate retries while retry request is loading', async () => {
    const pending = deferred<FeedItem[]>();
    mockedFetch.mockRejectedValueOnce(new Error('Connection unavailable'))
      .mockReturnValueOnce(pending.promise);
    const { result } = renderHook(() => useDataLoader());
    await act(async () => { await result.current.load(); });
    expect(result.current.view.status).toBe('ERROR');
    let retry!: Promise<void>;
    act(() => { retry = result.current.load(); void result.current.load(); });
    expect(result.current.view.status).toBe('LOADING');
    expect(mockedFetch).toHaveBeenCalledTimes(2);
    await act(async () => { pending.resolve(items); await retry; });
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

describe('async lifecycle regression scenarios', () => {
  it('retries after several consecutive failures then succeeds', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('First outage'))
      .mockRejectedValueOnce(new Error('Second outage'))
      .mockRejectedValueOnce(new Error('Third outage'))
      .mockResolvedValueOnce(items);
    const { result } = renderHook(() => useDataLoader());
    for (const message of ['First outage', 'Second outage', 'Third outage']) {
      await act(async () => { await result.current.load(); });
      expect(result.current.view).toEqual({ status: 'ERROR', error: message });
    }
    await act(async () => { await result.current.load(); });
    expect(result.current.view).toEqual({ status: 'SUCCESS', data: items });
    expect(mockedFetch).toHaveBeenCalledTimes(4);
  });

  it('coalesces a burst of retry attempts into a single in-flight request', async () => {
    const retry = deferred<FeedItem[]>();
    mockedFetch.mockRejectedValueOnce(new Error('Offline')).mockReturnValueOnce(retry.promise);
    const { result } = renderHook(() => useDataLoader());
    await act(async () => { await result.current.load(); });
    expect(result.current.view.status).toBe('ERROR');
    let inFlight!: Promise<void>;
    act(() => {
      inFlight = result.current.load();
      for (let n = 0; n < 12; n++) void result.current.load();
    });
    expect(mockedFetch).toHaveBeenCalledTimes(2);
    expect(result.current.view.status).toBe('LOADING');
    await act(async () => { retry.resolve(items); await inFlight; });
    expect(result.current.view).toEqual({ status: 'SUCCESS', data: items });
  });

  it('starts a fresh request after a previous request rejection', async () => {
    const old = deferred<FeedItem[]>();
    const latest = deferred<FeedItem[]>();
    mockedFetch.mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise);
    const { result } = renderHook(() => useDataLoader());
    let first!: Promise<void>;
    act(() => { first = result.current.load(); });
    // The first request has already settled; a later request must own the view.
    await act(async () => { old.reject(new Error('First request failed')); await first; });
    expect(result.current.view.status).toBe('ERROR');
    let second!: Promise<void>;
    act(() => { second = result.current.load(); });
    expect(result.current.view.status).toBe('LOADING');
    await act(async () => { latest.resolve(items); await second; });
    expect(result.current.view).toEqual({ status: 'SUCCESS', data: items });
  });

  it('aborts a pending request on unmount and ignores a late success', async () => {
    const pending = deferred<FeedItem[]>();
    mockedFetch.mockReturnValueOnce(pending.promise);
    const { result, unmount } = renderHook(() => useDataLoader());
    let inFlight!: Promise<void>;
    act(() => { inFlight = result.current.load(); });
    const signal = mockedFetch.mock.calls[0][1];
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => { pending.resolve(items); await inFlight; });
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });
});
