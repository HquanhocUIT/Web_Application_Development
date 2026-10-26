# Project Rules — Homework 3

These rules apply to the Flash-Sale E-Commerce Engine in this HW3 folder. Follow the work order and acceptance criteria in `TASK_DECOMPOSITION.md`.

## 1. Technology and dependencies

- Use React, TypeScript, HTML, CSS, and JavaScript.
- Prefer simple techniques covered in class. Do not add a library or dependency unless the task needs it; record why it is needed.
- Keep implementation readable and small enough to follow during a code review.

## 2. One subtask at a time

- Work on exactly one subtask from `TASK_DECOMPOSITION.md` at a time.
- Do not begin the next subtask automatically after finishing the current one. Wait for the user's next instruction.
- Keep changes for the active subtask focused. Do not implement future milestones early.

## 3. Design before coding

Before writing code for a subtask, briefly identify:

- the data and types it uses;
- component props, if any;
- state it reads or changes;
- the user or system event flow;
- acceptance criteria and the checks that will verify them.

Keep this design scoped to the active subtask.

## 4. Countdown timer

- Derive remaining time from an absolute deadline and `Date.now()` on each update. Never derive it by counting `setInterval` ticks.
- Use `requestAnimationFrame` when it suits the display update pattern. Stop the loop when the countdown ends or its component unmounts.
- Clamp remaining time at zero and handle a deadline that has already passed.
- Clear any timeout, interval, or animation frame created for the countdown during cleanup.

## 5. Inventory State Machine

- Define reservation and checkout states and their allowed transitions explicitly before implementing them.
- Reject invalid transitions, checkout from an ineligible state, and use of an expired reservation.
- Keep inventory and available quantity non-negative. A reservation may be released or consumed only once.
- Keep state changes in a clear operation so the stock check and reservation update cannot be separated by unrelated UI work.

## 6. Optimistic Inventory Lock

- Associate inventory state with a version. A purchase request must check the version it read when attempting to reserve inventory.
- On a version conflict, report the conflict and either retry with fresh state under a clear rule or reject the request. Never silently overwrite newer state.
- Ensure competing accepted reservations cannot exceed available stock in the simulation.

## 7. Concurrency claims

- Describe frontend concurrency as a simulation within the running application.
- Do not claim protection against overselling across browsers, devices, or users unless the application has a server-side atomic inventory update and synchronization mechanism.
- State the actual scope and limits of any concurrency check in the UI or project documentation where relevant.

## 8. Checks for each subtask

- Verify each subtask with checks suited to its acceptance criteria, and record the commands or manual steps and their actual results.
- After project initialization, use available scripts such as `npm run build`, `npm run lint`, and relevant tests when those scripts exist.
- If a script or test does not exist, do not report it as passed. Explain the available check or the limitation instead.

## 9. Git commits

- Create one meaningful Conventional Commit after both subtasks in a milestone are complete.
- Do not commit after each subtask. The WBS has milestones M0–M7, so the plan is at least eight milestone commits with real changes.
- Do not create empty, placeholder, or fabricated commits to reach the count.
- Keep each commit's message aligned with its milestone and actual changes, for example `feat(m3): handle inventory version conflicts`.

## 10. Project structure and accessibility

- Keep the project structure simple and scoped to this assignment.
- Use semantic HTML, responsive CSS, and controls that work with a keyboard.
- Provide clear labels and visible status feedback for purchase, stock, countdown, reservation, and checkout states.

## 11. Resource cleanup

- Clean up `requestAnimationFrame` callbacks, timers, event listeners, subscriptions, and other resources when they are no longer needed, especially when a component unmounts.
- Avoid duplicate loops or listeners when components render again.

## 12. AI failure audit

- Record AI mistakes that actually occur during implementation in `AI_FAILURE_AUDIT.md`.
- Each entry must include evidence, the observed impact, the cause, the correction, and the result of checking the correction.
- The final audit must contain at least three real errors. Do not invent errors, evidence, or test results; if fewer have occurred, continue recording actual issues as work proceeds.

## 13. Report verification honestly

- Do not claim browser, multi-device concurrency, load, or performance verification unless it was actually performed.
- Name the checks that were performed and their results. State environment limitations when they prevented a requested check.

## 14. File scope

- Create and edit assignment files only inside this HW3 folder.
- Do not modify HW1, HW2, or files outside HW3.
