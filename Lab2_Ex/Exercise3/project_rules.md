# Exercise 3 — Project Rules

**Project:** Resilient State Machine & Skeleton Loader  
**Course:** Modern React Architecture, Virtual DOM & State Machines

## 1. Technology Stack
- Use React Functional Components with TypeScript, HTML, and CSS.
- Use React hooks; do not use class components.
- Avoid unnecessary UI libraries and state-management dependencies.

## 2. State Model
- Manage view state with React `useState` and a typed `ViewState<T>` model.
- Allow exactly four view states: `IDLE`, `LOADING`, `SUCCESS`, and `ERROR`.
- Use TypeScript discriminated unions so each state has only the relevant fields (e.g., data for `SUCCESS`, error details for `ERROR`).
- Never mutate state or arrays/objects stored in state directly; use state setters with immutable updates.
- Render UI from the current state, without contradictory loading, success, and error displays.

## 3. Asynchronous Data Fetching
- Use `async/await` and `try/catch` to handle asynchronous requests.
- Transition to `LOADING` when a request begins, `SUCCESS` when it completes, and `ERROR` when it fails.
- Prevent race conditions: cancel outdated requests where possible (e.g., `AbortController`) and/or ignore responses that are no longer current using a request identifier.
- Do not update state after unmount or from a superseded request.
- Ensure Retry Connection starts a new valid request rather than reusing stale results.

## 4. Components and Styling
- Separate presentational components (e.g., data list, skeleton, error panel) from data-fetching logic.
- Keep components small, clearly named, readable, and maintainable.
- Organize CSS separately from TypeScript/TSX; avoid unnecessary inline styling.
- Implement a pulse-animated Skeleton Loader and respect reduced-motion preferences.
- Provide clear status messages and accessible button labels.

## 5. Workflow and Verification
- Follow `TASK_DECOMPOSITION.md` in WBS order.
- Complete and verify each task or milestone before moving to the next.
- Check all four states, success/failure paths, Retry Connection, stale-request behavior, and UI consistency.
- Fix errors found during testing before proceeding.

## 6. Current Scope
- This file defines implementation rules only.
- Do **not** implement application code at this step.
