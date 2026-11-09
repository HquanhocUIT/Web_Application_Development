# Work Breakdown Structure (WBS)

## Homework 1: Lab 3 — Production Studio Drum Kit

### T01 – Project Setup & Drum UI

- [x] **T01.1: Set up React 19, Vite and TypeScript.**
  - **Acceptance:** The Lab3_HW project is configured to run with React 19, Vite and TypeScript.
- [x] **T01.2: Create 7 drum pads (W, A, S, D, J, K, L).**
  - **Acceptance:** Seven pads are present and each shows its assigned key.
- [x] **T01.3: Build the basic layout with CSS Modules.**
  - **Acceptance:** The drum kit uses CSS Modules for its component styling.

### T02 – Drum Audio & Keyboard Controls

- [x] **T02.1: Add drum sounds for mouse and keyboard.**
  - **Acceptance:** Clicking a pad or activating its key plays that pad's sound.
- [x] **T02.2: Handle keyboard events using `e.code`, prevent `e.repeat`, and ignore typing inside form elements.**
  - **Acceptance:** Only the intended first key press triggers a sound; form editing remains unaffected.
- [x] **T02.3: Clean up keyboard listeners and audio resources.**
  - **Acceptance:** Listeners and audio resources are released when no longer needed.

### T03 – Visual Feedback & Accessibility

- [x] **T03.1: Add visual hit effects, hit history and decibel meter.**
  - **Acceptance:** Hits produce visible feedback, appear in history and update the meter.
- [x] **T03.2: Apply semantic HTML, `aria-pressed`, `aria-live` and keyboard accessibility.**
  - **Acceptance:** Pads expose their state and hit updates are announced; all pad actions are keyboard accessible.
- [x] **T03.3: Make the UI responsive at 375px and follow WCAG 2.2 AA.**
  - **Acceptance:** The interface remains usable at 375px and meets applicable WCAG 2.2 AA criteria.

### T04 – Testing, Audit & Submission

- [x] **T04.1: Run functional tests, lint, typecheck and build.**
  - **Acceptance:** Each check completes successfully, with any limitations recorded.
- [x] **T04.2: Run Lighthouse, fix accessibility issues and save screenshots.**
  - **Acceptance:** Production Mobile audits score 100 in all categories; the render-blocking CSS request is removed and before/after metrics plus remaining diagnostics are documented.
- [x] **T04.3: Create `AI_FAILURE_AUDIT.md` with 3 verified AI bugs and prepare submission evidence.**
  - **Acceptance:** The audit documents three evidence-backed bugs and the submission evidence is collected.

## Homework 2: Lab 3 — 88-Key Polyphonic Piano & Concurrent FIFO Sequencer

### T01 – Project Setup & 88-Key Piano UI

- [ ] **T01.1: Set up React 19, Vite and TypeScript.**
  - **Acceptance:** The Homework 2 app runs with React 19, Vite and TypeScript.
- [ ] **T01.2: Generate all 88 piano keys (A0–C8) algorithmically using MIDI values and frequency calculation.**
  - **Acceptance:** MIDI-based generation produces 88 keys from A0 through C8 with correct frequencies.
- [ ] **T01.3: Create reusable PianoKeyboard and PianoKey components with a responsive layout.**
  - **Acceptance:** All keys render through reusable components and remain usable on mobile and desktop.

### T02 – Polyphonic Audio Engine

- [ ] **T02.1: Implement sound generation using Web Audio API.**
  - **Acceptance:** Activating a key produces its corresponding pitch through Web Audio.
- [ ] **T02.2: Support up to 8 simultaneous voices with FIFO voice stealing.**
  - **Acceptance:** Up to eight notes sound together; each additional note releases the oldest voice first.
- [ ] **T02.3: Implement smooth ADSR release, audio cleanup and active voice tracking.**
  - **Acceptance:** Voices release smoothly, active voices are tracked, and audio resources are cleaned up.

### T03 – Performance, Recording & Replay

- [ ] **T03.1: Optimize all 88 keys with React.memo and verify rendering using React DevTools Profiler.**
  - **Acceptance:** Piano keys use memoization and Profiler evidence confirms unchanged keys avoid unnecessary renders.
- [ ] **T03.2: Record MIDI notes, frequencies, durations and timing.**
  - **Acceptance:** Recording captures each played note's MIDI value, frequency, duration and relative timing.
- [ ] **T03.3: Implement FIFO replay at 0.5x, 1x and 2x, with Stop and AbortController cancellation.**
  - **Acceptance:** Replay preserves event order and selected speed; Stop aborts pending and active scheduled work.

### T04 – Testing, Audit & Submission

- [ ] **T04.1: Test piano functions, FIFO behavior, recording, replay and cleanup.**
  - **Acceptance:** Tests verify key generation, polyphony, FIFO stealing, recording, playback order and cleanup.
- [ ] **T04.2: Check responsive design, accessibility, React Profiler and Lighthouse.**
  - **Acceptance:** Mobile and desktop checks, accessibility review, Profiler evidence and Lighthouse results are recorded.
- [ ] **T04.3: Create `AI_FAILURE_AUDIT.md` with at least 3 verified AI-generated bugs and review submission requirements.**
  - **Acceptance:** The audit includes three evidence-backed bugs, and required submission files and evidence are reviewed.
