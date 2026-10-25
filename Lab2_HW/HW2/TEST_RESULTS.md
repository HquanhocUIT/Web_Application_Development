# Homework 2 Test Results — M5-01

## Environment

- `npm run dev -- --host 127.0.0.1` started Vite at `http://127.0.0.1:5173/`.
- PowerShell requests to `/`, `/src/App.tsx`, and `/src/audio/audio-decoder.ts` returned HTTP 200.
- Chrome and Edge are installed, but both headless runs failed before rendering because the GPU process exited with code `-1073741790` and reported that the GPU process was unusable. No browser interaction or screenshot was completed.
- Node.js does not provide a browser DOM or a real `AudioContext`, so audio and UI behavior below was checked with mocks where possible.

## Checks

| Check | Result | Method and evidence |
| --- | --- | --- |
| Vite page and source modules load | Pass | Dev server HTTP 200 for `/`, `App.tsx`, and `audio-decoder.ts`. |
| Initial controls and empty states render | Pass | React SSR confirmed Audio URL, Add to Queue, queue empty state, FFT selector, Stop, and visualizer placeholder. |
| FIFO ordering and one task at a time | Pass | Mock processor handled four almost-simultaneous tasks in input order; maximum active processor count was 1. |
| Queue recovers after a task fails | Pass | Middle mock task rejected; later tasks completed and snapshots showed completed/failed/completed/completed. |
| Cancel a queued task and clean up active work | Pass | Mock queue cancellation returned AbortError for queued and active promises; cleanup emptied its snapshot without pending promises. |
| Cancel while fetching | Pass | Mock fetch listened to `AbortSignal`; cancellation settled the task with AbortError. |
| Cancel after decode starts | Pass | Mock decode was allowed to finish; the decoder discarded the buffer and the task settled as cancelled. |
| Invalid URL, network, HTTP, and decode failures | Pass | Decoder mocks returned the expected errors for an unsupported protocol, rejected fetch, HTTP 503, and invalid audio data. |
| Play, Stop, replace playback, natural end, and cleanup | Pass | Mock AudioContext verified source/analyser disconnect, AudioBuffer and callback release, single shared context, and context close during cleanup. |
| FFT 256 and 512 | Pass | Mock playback pipeline set both supported `AnalyserNode.fftSize` values. |
| Canvas frequency bars | Pass | Drawing helper mocks verified 128 and 256 frequency bins were read and drawn. |
| RAF cleanup, analyser change, and StrictMode-style replay | Pass | Mock scheduler verified loop cancellation on cleanup and one scheduled loop after setup-cleanup-setup. |
| No React state update on each animation frame | Pass | Code review: the animation callback only reads analyser data and draws to Canvas; it does not call a React state setter. |
| Responsive CSS structure | Partial | Code review found a 42rem stacking breakpoint, wrapping URLs, and flexible content sizing. Actual 320px, 375px, 768px, and 1280px viewport rendering was not tested. |
| Keyboard and focus-visible behavior | Partial | Native form controls/buttons and `:focus-visible` styles are present. Tab/Enter/Space behavior was not exercised in a browser. |
| Real audio loading, playback, and live analyser output | Not Tested | No working browser AudioContext was available; mock nodes do not prove audible output or live frequency values. |
| DevTools memory/resource inspection and measured FPS | Not Tested | Browser DevTools could not be opened; no real FPS or memory profile was captured. |
| Screenshots | Not Tested | No genuine browser screenshot could be captured. `screenshots/` contains an explanatory README only. |

## Issues and handling

- No new application defect was reproduced in the M5-01 mock checks.
- A lifecycle issue found and fixed during M4 (playback source retaining its callback and decoded buffer, and decoder cleanup not stopping owned pipelines) passed the M5 mock regression checks.
- Browser GPU startup failures are environment limitations, not failures attributed to the application.

## Manual checks still needed

1. Open the app in a working Chrome or Edge browser and add several accessible audio URLs close together. Confirm queue order and visible status changes.
2. Cancel one pending task and one task while it is fetching. If possible, also cancel after decode begins and confirm its result is discarded.
3. Load a valid audio file, play it, change FFT 256/512, stop it, play a different task, and let one track end naturally. Confirm the Canvas bars follow the audio.
4. Try an unsupported URL, a network failure, an HTTP error, and a non-audio file; confirm the task reports failed without blocking later tasks.
5. Check keyboard operation and focus-visible, then inspect 320px, 375px, 768px, and 1280px layouts.
6. Use DevTools to check console errors, remaining audio nodes/contexts after Stop and unmount, and actual animation FPS. Save genuine screenshots of the main page, multi-task queue, cancellation, and active playback/visualizer in `screenshots/`.
