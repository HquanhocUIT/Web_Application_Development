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

- [x] **T01.1: Set up React 19, Vite and TypeScript.**
  - **Acceptance:** The Homework 2 app runs with React 19, Vite and TypeScript.
- [x] **T01.2: Generate all 88 piano keys (A0–C8) algorithmically using MIDI values and frequency calculation.**
  - **Acceptance:** MIDI-based generation produces 88 keys from A0 through C8 with correct frequencies.
- [x] **T01.3: Create reusable PianoKeyboard and PianoKey components with a responsive layout.**
  - **Acceptance:** All keys render through reusable components and remain usable on mobile and desktop.

### T02 – Polyphonic Audio Engine

- [x] **T02.1: Implement sound generation using Web Audio API.**
  - **Acceptance:** Audio initializes or resumes on user input; MIDI notes 21–108 produce their formula-correct pitches.
- [x] **T02.2: Support up to 8 simultaneous voices with FIFO voice stealing.**
  - **Acceptance:** An insertion-ordered `Map` tracks at most eight active voices; duplicates are ignored and the ninth distinct note releases the oldest.
- [x] **T02.3: Implement smooth ADSR release, audio cleanup and active voice tracking.**
  - **Acceptance:** Gain envelopes release smoothly; pointer, touch and keyboard releases stop notes and clear the active highlight; overlapping inputs do not duplicate notes. Oscillators, gains and the audio context are cleaned up. Focused tests pass.

### T03 – Performance, Recording & Replay

- [x] **T03.1: Optimize all 88 keys with React.memo and verify rendering using React DevTools Profiler.**
  - **Acceptance:** Piano keys are memoized with stable internal handlers; a React Profiler API test confirms pressing one of 88 keys commits only that key subtree. React DevTools Profiler was unavailable and was not claimed.
- [x] **T03.2: Record MIDI notes, frequencies, durations and timing.**
  - **Acceptance:** Recording stores notes in start order with MIDI, formula-derived frequency, monotonic start offset and duration, including overlaps.
- [x] **T03.3: Implement FIFO replay at 0.5x, 1x and 2x, with Stop and AbortController cancellation.**
  - **Acceptance:** Replay preserves recorded timing and overlaps at all three speeds; Stop, restart and unmount abort waits and release playback-owned voices.

### T04 – Testing, Audit & Submission

- [x] **T04.1: Test piano functions, FIFO behavior, recording, replay and cleanup.**
  - **Acceptance:** 38 automated tests pass, verifying key generation, polyphony, FIFO stealing, recording, playback order, cleanup, pressed-state feedback and input deduplication. Production Chrome verifies C4 schedules at 261.63 Hz and the highlight resets on release with no application console errors.
- [ ] **T04.2: Check responsive design, accessibility, React Profiler and Lighthouse.**
  - **Acceptance:** Headless Chrome verifies the 375px and 1440px layouts, internal keyboard scrolling, C4 initial centering, and pointer/keyboard operation. The task remains open until React DevTools Profiler and Lighthouse evidence are recorded.
- [x] **T04.3: Create `AI_FAILURE_AUDIT.md` with at least 3 verified AI-generated bugs and review submission requirements.**
  - **Acceptance:** The audit retains three evidence-backed Homework 1 defects with affected files, discovery, fixes and commit/report evidence. The Homework 2 history was reviewed; no additional verified piano defect was found. The piano screen and key generator are implemented, T04.1 is verified, browser responsive and input checks are recorded, and T04.2 remains open pending React DevTools Profiler and Lighthouse evidence; screenshots are left for manual capture.

## Homework 3: Lab 3 – KRAFTON x PUBG Vietnam Championship & Airdrop Arena

### T01 – Project Setup & PUBG Arena UI

- [x] **T01.1: Set up the PUBG Arena folder, components and `/hw3` route.**
  - **Acceptance:** `src/homeworks/PUBGArena/` contains the HW3 screen and reusable components; production preview serves `/hw3` directly with HTTP 200.
- [x] **T01.2: Create PUBG squad, airdrop and ticket datasets with TypeScript interfaces.**
  - **Acceptance:** `PubgPhase`, `PubgCrateDrop`, `PubgTicket` and `PubgVnSquadStanding` type the clearly labeled local mock datasets; no claim API is connected.
- [x] **T01.3: Build a modern responsive esports dashboard.**
  - **Acceptance:** Championship, countdown preview, reward inventory/prices and four-squad leaderboard render at 375px and 1440px without horizontal page overflow; loading, empty and error UI states are provided.

### T02 – Anti-Drift Countdown

- [x] **T02.1: Create the `usePubgAirdropTimer` hook using `Date.now()` and an absolute target timestamp.**
  - **Acceptance:** The hook derives time from absolute opening/closing timestamps on each tick and supports an optional server offset; normal and offset calculations pass tests.
- [x] **T02.2: Add `visibilitychange` synchronization and proper timer cleanup.**
  - **Acceptance:** Returning to a visible tab recalculates immediately; tests verify hidden/visible synchronization and interval/listener cleanup on unmount.
- [x] **T02.3: Display the live countdown and unlock airdrops when time expires.**
  - **Acceptance:** Days, hours, minutes and seconds render without negative values; `WARMUP`, `AIRDROP_LIVE`, `LOOTED_OUT` and `EXPIRED` states gate claim controls. Full suite passes 49 tests; lint, typecheck and production build pass.

### T03 – Airdrop Claims & Leaderboard

- [x] **T03.1: Implement optimistic ticket and crate claiming.**
  - **Acceptance:** VIP pass, crate and ticket inventory decrement immediately; the mock API is authoritative and successful responses reconcile displayed stock. Unit tests and production preview claims pass.
- [x] **T03.2: Prevent duplicate requests and roll back inventory on HTTP 409 conflicts.**
  - **Acceptance:** Pending duplicate claims are ignored; 409 responses restore server inventory, network errors roll back, concurrent claims remain consistent, and cancelled or stale responses cannot overwrite newer state. Focused tests pass.
- [x] **T03.3: Create the PUBG Vietnam leaderboard with filtering and sorting.**
  - **Acceptance:** All four squads show WWCD, placement, kill and derived total points; pure immutable filtering and sorting controls pass focused tests.

### T04 – Testing, Audit & Submission

- [x] **T04.1: Test countdown accuracy, claiming, rollback and leaderboard.**
  - **Acceptance:** All 64 automated tests pass, covering all four timer phases, absolute-time/visibility synchronization and cleanup, claim success/409/deduplication/concurrency/network failure/cancellation, leaderboard filters/sorts and direct `/hw3` rendering. Production Chrome confirms live claims, inventory reconciliation, keyboard focus order and visible focus indicators.
- [x] **T04.2: Verify responsive design, WCAG 2.2 AA, Lighthouse and production build.**
  - **Acceptance:** Production preview has no horizontal page overflow at 375px or 1440px. Mobile Lighthouse improved from 100/96/96/100 to 100/100/100/100 (Performance/Accessibility/Best Practices/SEO); FCP 1.3s→1.2s, LCP 1.4s→1.4s, TBT 30ms→10ms, CLS 0, Speed Index 1.5s→1.2s, with no weighted accessibility or best-practice audit failures. Lint, typecheck and production build pass.
- [x] **T04.3: Create `AI_FAILURE_AUDIT.md` with at least 3 verified AI-generated bugs and prepare the final submission.**
  - **Acceptance:** The audit retains the three verified Homework 1 findings and adds three HW3 Lighthouse-confirmed accessibility defects, each with discovery, cause, fix and commit/test evidence. Rules, WBS, React source and tests are present; 64 tests, lint, typecheck and build pass. Production Chrome confirms `/hw1`, `/hw2` and `/hw3` load directly and refresh successfully. Six meaningful HW3 milestone commits exist before this final documentation commit; no artificial commits or screenshots were added.
