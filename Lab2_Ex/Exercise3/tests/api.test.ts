import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchFeed } from '../src/services/api';

afterEach(() => vi.useRealTimers());
describe('simulated API', () => {
  it('success returns typed records', async () => {
    vi.useFakeTimers();
    const promise = fetchFeed('success', new AbortController().signal);
    const result = expect(promise).resolves.toHaveLength(4);
    await vi.advanceTimersByTimeAsync(1300);
    await result;
  });
  it('failure rejects', async () => {
    vi.useFakeTimers();
    const promise = fetchFeed('failure', new AbortController().signal);
    const result = expect(promise).rejects.toThrow('connect');
    await vi.advanceTimersByTimeAsync(1300);
    await result;
  });
  it('abort rejects without delivering results', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const promise = fetchFeed('success', controller.signal);
    const result = expect(promise).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await result;
  });
});
