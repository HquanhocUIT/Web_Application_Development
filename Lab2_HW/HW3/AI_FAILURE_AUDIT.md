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
