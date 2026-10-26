# AI Failure Audit

Final audit for M7-02: this file records 9 implementation mistakes that actually occurred. Each entry includes observed evidence, impact, cause, correction, and a check after correction. The entries are limited to errors observed during this project; no fabricated failures were added.

## M3-02

### 1. Imported `InventoryEvent` from the wrong module

- **Evidence:** The first `npm.cmd run build` reported `src/domain/optimisticInventoryLock.types.ts(6,15): error TS2305: Module './flashSale.types' has no exported member 'InventoryEvent'.`
- **Impact:** TypeScript could not build the new lock contract.
- **Cause:** The event union is declared in `inventoryMachine.types.ts`, but the new contract imported it from `flashSale.types.ts`.
- **Correction:** Moved the type-only import to `inventoryMachine.types.ts`.
- **Recheck:** The final `npm.cmd run build`, `npm.cmd run lint`, and all 34 Node tests passed.

### 2. Left an unused `Reservation` type import in the engine

- **Evidence:** A subsequent `npm.cmd run build` reported `src/domain/optimisticInventoryEngine.ts(2,40): error TS6196: 'Reservation' is declared but its value is never read.`
- **Impact:** TypeScript stopped the build before bundling.
- **Cause:** The engine inferred the reservation type and did not need the explicit import.
- **Correction:** Removed `Reservation` from the engine import list.
- **Recheck:** The final `npm.cmd run build`, `npm.cmd run lint`, and all 34 Node tests passed.

## M4-01

### 3. Used an extensionless runtime import in the expiration module

- **Evidence:** The first `node --experimental-strip-types --test tests/*.test.mjs` run failed loading `tests/reservationExpiration.test.mjs` with `ERR_MODULE_NOT_FOUND`, naming `src/domain/inventoryMachine` imported from `src/domain/reservationExpiration.ts`. The same run showed the existing 34 tests passing before the new test file failed to load.
- **Impact:** The expiration tests could not run under the project's Node test command, even though the TypeScript build and lint passed.
- **Cause:** Node's native TypeScript stripping resolves the runtime import as an ES module and requires the explicit `.ts` extension used by this test setup.
- **Correction:** Changed the runtime import to `./inventoryMachine.ts`.
- **Recheck:** `npm.cmd run build`, `npm.cmd run lint`, and the full Node test suite passed; the suite reported 41 tests, 41 passed, 0 failed.

## M5-01

### 4. Combined delete and add operations for the same stylesheet in one patch

- **Evidence:** The patch tool rejected the stylesheet replacement with `invalid patch: multiple operations target .../src/App.css` before applying any part of that patch.
- **Impact:** The initial combined edit did not update the UI stylesheet.
- **Cause:** The patch contained both a delete and an add operation for `App.css`, which the tool does not accept as two operations on one path in a single patch.
- **Correction:** Applied the deletion and file creation in separate patch operations, then added the remaining UI files.
- **Recheck:** `npm.cmd run build`, `npm.cmd run lint`, and all 48 existing Node tests passed after the corrected edits.

## M5-02

### 5. Read a checkout failure field before narrowing the result union

- **Evidence:** The first M5-02 `npm.cmd run build` reported `src/components/FlashSalePage.tsx(188,46): error TS2339: Property 'reason' does not exist on type 'CheckoutWorkflowResult'`.
- **Impact:** The checkout UI did not type-check, so the production build stopped.
- **Cause:** The UI's `else` branch had not narrowed the workflow result to `status: 'rejected'` before reading `reason`.
- **Correction:** Changed the result handling to branch on `status === 'rejected'` first, then handle the two successful outcomes.
- **Recheck:** The subsequent `npm.cmd run build`, `npm.cmd run lint`, and all 54 Node tests passed.

### 6. Accessed a ref during render and scanned expirations synchronously in an effect

- **Evidence:** The first M5-02 `npm.cmd run lint` reported `react-hooks/refs` at the lazy snapshot initializer and `react-hooks/set-state-in-effect` for calling the expiration scan directly in the effect body.
- **Impact:** Lint rejected the component's engine initialization and timer setup pattern.
- **Cause:** The engine ref was read while deriving initial React state, and the effect synchronously caused state updates instead of waiting for an external timer callback.
- **Correction:** Kept the per-product engine map in a lazy React state initializer so it remains stable across rerenders; retained refs only for event-time request tracking; started expiration scans from the interval callback and kept cleanup with `clearInterval`.
- **Recheck:** The subsequent `npm.cmd run build`, `npm.cmd run lint`, and all 54 Node tests passed.

## M6-02

### 7. Repeated reservation actions had ambiguous accessible names

- **Evidence:** Static review of `src/components/ReservationPanel.tsx` found that every reservation rendered the same button names (`Checkout`, `Từ chối thanh toán`, and `Hủy giữ hàng`) without a reservation-specific accessible label.
- **Impact:** With more than one active reservation, assistive technology users could encounter identical action names without knowing which reservation each button would affect.
- **Cause:** The actions were rendered in a repeated list item, but their labels were written as standalone text and did not include the reservation identifier.
- **Correction:** Added an `aria-label` to each action containing its operation and reservation ID.
- **Recheck:** Source review confirms each repeated action now has a reservation-specific accessible name. Build, lint, and Node test results are recorded in `TEST_RESULTS.md`; browser screen-reader behavior remains untested in this environment.

## M7-01

### 8. Left the app's default favicon request unresolved

- **Evidence:** The first Edge headless run logged `Failed to load resource: the server responded with a status of 404 (Not Found)`. A direct request to `http://127.0.0.1:5173/favicon.ico` also returned HTTP 404 while no favicon was declared in `index.html`.
- **Impact:** The browser console showed a failed resource request during an otherwise successful app run.
- **Cause:** The HTML did not declare a favicon, so the browser attempted its default `/favicon.ico` request.
- **Correction:** Declared an empty data favicon in `index.html` to stop the browser from requesting a nonexistent asset.
- **Recheck:** Re-ran the Edge headless interaction/capture script; it reported no Console warnings/errors or runtime exceptions. The app root returned HTTP 200.

### 9. Wrote invalid nested quotes in the browser capture script

- **Evidence:** The first `node --check screenshots/capture_browser.mjs` run failed with `SyntaxError: missing ) after argument list` at the selector expression containing `[aria-live="polite"]`.
- **Impact:** The browser interaction script could not start, delaying M7-01 screenshot capture.
- **Cause:** JavaScript string delimiters were reused inside a quoted selector expression without escaping.
- **Correction:** Changed the CDP expressions to use valid unquoted attribute selector values such as `[aria-live=polite]` and `[aria-label^=Checkout]`.
- **Recheck:** `node --check screenshots/capture_browser.mjs` passed, and the subsequent Edge capture run completed all interactions and produced six PNG files. The capture script and PNGs were later removed at the user's request; the recorded run was real.

## M7-02 final review

- **Evidence count:** 9 documented implementation mistakes, spanning M3-02 through M7-01. Each entry has an observed error or source finding, impact, cause, correction, and recheck result above.
- **Final recheck:** `npm.cmd run build` passed; `npm.cmd run lint` passed; `node --experimental-strip-types --test tests/*.test.mjs` passed all 61 tests; `git diff --check` passed.
- **Evidence limits:** browser evidence is from Edge headless. `06-stress-test.png` has not been captured. The screenshot directory was removed at the user's request. React DevTools, FPS, Lighthouse, screen-reader, and non-headless browser checks remain pending as recorded in `TEST_RESULTS.md`.
