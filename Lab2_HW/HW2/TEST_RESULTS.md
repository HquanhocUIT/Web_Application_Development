# Homework 2 Test Results — M5-01

## Environment

- `npm run dev -- --host 127.0.0.1` started Vite at `http://127.0.0.1:5173/`.
- PowerShell requests to `/`, `/src/App.tsx`, and `/src/audio/audio-decoder.ts` returned HTTP 200.
- Chrome and Edge are installed, but both headless runs failed before rendering because the GPU process exited with code `-1073741790` and reported that the GPU process was unusable. No browser interaction or screenshot was completed.
- Node.js does not provide a browser DOM or a real `AudioContext`, so audio and UI behavior below was checked with mocks where possible.

## Follow-up owner verification (2026-10-26)

The project owner reports that the remaining manual browser checks were completed successfully and that screenshots were captured in a separate document. That document is not present in the HW2 workspace, so its images and detailed observations could not be independently inspected here. The browser-only rows below are marked **Pass (owner-reported)** to distinguish this report from checks performed by the assistant.

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
| Responsive layout at 320px, 375px, 768px, and 1280px | Pass (owner-reported) | Project owner reports manual viewport checks passed; screenshots are embedded in a separate document not present in this workspace. |
| Keyboard controls and focus-visible behavior | Pass (owner-reported) | Project owner reports manual keyboard checks passed; not independently repeated in this environment. |
| Real audio loading, playback, FFT selection, and live analyser output | Pass (owner-reported) | Project owner reports manual browser playback checks passed; not independently repeated in this environment. |
| DevTools memory/resource inspection and measured FPS | Pass (owner-reported) | Project owner reports these checks passed; measurement values and the referenced document were not provided in HW2. |
| Screenshot evidence | Pass (owner-reported) | Project owner reports genuine screenshots are embedded in a separate document. No screenshot file is stored in this repository. |

## Issues and handling

- No new application defect was reproduced in the M5-01 mock checks.
- A lifecycle issue found and fixed during M4 (playback source retaining its callback and decoded buffer, and decoder cleanup not stopping owned pipelines) passed the M5 mock regression checks.
- Browser GPU startup failures are environment limitations, not failures attributed to the application.

## Evidence limitations

- The project owner reports that the manual checks and screenshots are complete, but the separate document containing the screenshots was not supplied in the HW2 workspace and could not be reviewed here.
- The earlier Chrome/Edge headless GPU failure remains the reason these manual results are attributed to the owner rather than to this automated session.
- The exact FPS/memory values and browser version are not recorded in this repository.
