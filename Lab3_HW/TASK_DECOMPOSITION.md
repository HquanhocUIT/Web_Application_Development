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
  - **Acceptance:** Production mobile reports, screenshots and console-source findings are saved; the final clean run scores 100 in all four categories and remaining score-neutral audits are documented.
- [x] **T04.3: Create `AI_FAILURE_AUDIT.md` with 3 verified AI bugs and prepare submission evidence.**
  - **Acceptance:** The audit documents three evidence-backed bugs and the submission evidence is collected.
