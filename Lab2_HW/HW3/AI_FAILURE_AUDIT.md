# AI Failure Audit (ongoing)

This is an evidence log for real implementation mistakes. Complete the final audit in M7; these entries do not claim the minimum final count has been reached.

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
