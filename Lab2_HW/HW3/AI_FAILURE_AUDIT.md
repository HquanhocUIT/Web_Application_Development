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
