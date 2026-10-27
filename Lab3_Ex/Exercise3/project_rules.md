# Project Rules — Lab 3, Exercise 3

**Exercise:** KRAFTON PUBG Vietnam Series (PVS) Live Telemetry

**Work scope:** `Lab3_Ex/Exercise3` only
**Task order and commit checkpoints:** `TASK_DECOMPOSITION.md`

## 1. Technology and implementation style

- Use React 19, JavaScript/JSX, semantic HTML, and CSS. Prefer concepts covered in class and keep code readable.
- Follow Anti-Monolithic Vibe Coding: complete only the explicitly requested subtask in the WBS, then stop.
- Do not add a UI library or other dependency unless the task requires it.
- Do not use `dangerouslySetInnerHTML`, `window.alert()`, or unnecessary complex techniques.

## 2. Design before implementation

- Before writing application code, define the data schema, component props, state machine, and asynchronous request flow.
- The main component is `PubgMatchTelemetry.jsx` and manages the selected PUBG Vietnam Series telemetry.
- Keep one view-state object with `status`, `data`, and `error` rather than separate, contradictory loading/success/error state flags.

## 3. Squad data

- `PUBG_VN_SQUADS` must contain exactly these three records, with stable IDs:
  - `ces`: Cerberus Esports, Erangel, Phase 6, alive 4, kills 14, `wwcdProb` 68%, status `In Safe Zone`.
  - `te`: The Expendables, Miramar, Phase 7, alive 4, kills 18, `wwcdProb` 82%, status `Holding High Ground`.
  - `ge`: Genius Esports, Taego, Phase 5, alive 3, kills 9, `wwcdProb` 41%, status `Rotating Blue Zone`.
- On success, show every specified field: name, map, phase, alive, kills, `wwcdProb`, and status.
- The squad selector must have a clear label or accessible name. Render mapped items with stable keys.

## 4. Request state machine and cancellation

- Use exactly four request statuses: `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- Use `useEffect` to load telemetry when `squadId` or `retryTick` changes.
- Create a new `AbortController` for each effect run, pass `controller.signal` to the telemetry loader, and return cleanup that calls `controller.abort()`.
- The simulated wait/request must listen to the signal and reject with an `AbortError` when cancelled; merely ignoring a completed response does not count as cancelling the request.
- Ignore `AbortError`; it must not transition the view to `ERROR` or show an error alert.
- Prevent stale responses from updating state after a squad change or unmount. Clean up timers/listeners as well as aborting the request.
- Simulate 35% packet loss only for Erangel and Miramar. Do not apply this failure probability to Taego unless the assignment specification changes.

## 5. Loading, error, and retry behavior

- While `LOADING`, show a 220px-tall Skeleton card with a pulsing Blue-Zone effect and `aria-busy="true"`.
- For a real network/simulated packet-loss failure, show a clear message in a `<section role="alert">`.
- Provide a clearly named `Reconnect Satellite` or `Reconnect Telemetry` button in `ERROR`.
- Retry by incrementing `retryTick`; its change must trigger the request effect again.

## 6. Accessibility and responsive design

- Keep labels, semantic elements, keyboard access, visible focus styles, and readable contrast.
- Keep the interface responsive. Do not claim focus, responsive, screen-reader, or browser behavior passed unless it was actually tested.
- Do not change the squad data or hide request errors to improve a test result.

## 7. Verification and reporting

- After each implementation subtask, run `npm.cmd run build`, `npm.cmd run lint`, and relevant checks when available. If there is no project yet, do not initialize it outside the assigned subtask.
- Test rapid CES → TE → GE switching, cancellation, `AbortError`, loading skeleton, Erangel/Miramar packet loss, retry, stale-data protection, and render warnings when the environment permits.
- Use React DevTools and Network Slow 3G if available. Report limitations instead of inventing test evidence or results.
- If a tool or implementation error occurs, explain its observed cause, correction, and recheck result.

## 8. Git and workspace boundaries

- Create exactly two commits, only at the checkpoints in `TASK_DECOMPOSITION.md`:
  1. `feat(ex3): implement PUBG VN 4-state telemetry & AbortController`
  2. `feat(ex3): add skeleton UI & retry alert`
- Do not create additional commits, amend prior commits, or push to GitHub unless separately authorized.
- Edit, stage, and commit files only inside `Lab3_Ex/Exercise3`. Preserve Exercise1, Exercise2, Homework, and existing Lab2_Ex changes.

## Current task boundary

- For the request to create this rules file, create only `project_rules.md` in Exercise3.
- Read but do not modify `TASK_DECOMPOSITION.md`.
- Do not initialize React, install dependencies, write application code, begin E3-01, or create a Git commit.
