import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';

vi.mock('../src/services/api', () => ({
  fetchFeed: vi.fn(async (mode: string, signal: AbortSignal) => {
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, 15);
      signal.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted','AbortError')); }, { once: true });
    });
    if (mode === 'failure') throw new Error('Test network failure');
    return [{ id: 'a', title: 'Test story', summary: 'Sample data', category: 'Design', author: 'A Person', date: 'Today', readTime: '2 min' }];
  }),
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe('Data Feed integration', () => {
  it('renders IDLE, LOADING and SUCCESS', async () => {
    render(<App />);
    expect(screen.getByText('A little inspiration awaits.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /explore the feed/i }));
    expect(screen.getByRole('status', { name: /loading feed items/i })).toBeTruthy();
    expect(await screen.findByText('Test story')).toBeTruthy();
    expect(screen.getByText('SUCCESS')).toBeTruthy();
  });
  it('shows ERROR and retries successfully', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Connection scenario'), { target: { value: 'failure' } });
    fireEvent.click(screen.getByRole('button', { name: /load feed/i }));
    expect(await screen.findByText('Test network failure')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Connection scenario'), { target: { value: 'success' } });
    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }));
    await waitFor(() => expect(screen.getByText('Test story')).toBeTruthy());
  });
});
