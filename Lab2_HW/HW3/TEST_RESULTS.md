# M6 Integration and Test Results

## Environment and commands

- Runtime: Node.js native test runner with TypeScript type stripping.
- `node --experimental-strip-types --test tests/*.test.mjs`: **Pass**, 61 tests, 61 passed, 0 failed.
- `npm.cmd run build`: **Pass**, TypeScript build and Vite production bundle completed.
- `npm.cmd run lint`: **Pass**, ESLint completed without findings.
- `git diff --check`: **Pass**, no whitespace errors; Git emitted only LF-to-CRLF normalization warnings for two edited files.
- No browser executable or DOM-based React test runner is configured in this environment. Results below that use Node or mocked scheduling do not represent a browser run.
- For M6-02, `src/components`, `src/domain`, `src/App.css`, `src/index.css`, and `src/components/FlashSaleCountdown.css` were reviewed statically. Static review does not establish rendered layout, browser accessibility behavior, or absence of console/runtime warnings.

## Results by group

| Group | Result | Method and evidence |
| --- | --- | --- |
| Main reserve, checkout, cancel, and expiration flow | Pass | Node integration tests in `tests/flashSaleIntegration.test.mjs`; reservation changes available stock, checkout moves held units to sold, and cancellation/expiration releases a hold once. |
| Product isolation | Pass | Integration test creates two product engines and verifies actions and versions remain product-specific. |
| Checkout success, repeat checkout, and payment failure | Pass | Node integration and checkout workflow tests; duplicate checkout does not change state, declined payment releases its hold and does not increase sold quantity. |
| Expiration and purchase overlap | Pass | Integration test schedules a reservation attempt against the old version, expires the existing hold, and verifies the retry reserves the newly available unit. |
| Cancellation and purchase overlap | Pass | Integration test performs a purchase attempt and cancellation before its promise continuation; the version retry sees the released unit and preserves inventory invariants. |
| Same-version requests for the last unit | Pass | Two requests use the same `expectedVersion`; at most one holds the single unit. Existing engine test also verifies conflict behavior without a retry. |
| Optimistic lock retry, conflict, and duplicate request | Pass | `tests/optimisticInventoryEngine.test.mjs` covers bounded retries, business failures without retry, stale versions, request ID replay, and request ID reuse. |
| Concurrency stress: 10 requests | Pass | `tests/inventoryStress.test.mjs` sends 10 `Promise.all` requests to one engine with 3 units. Exactly 3 reservations succeed; no inventory invariant is violated. |
| Concurrency stress: 100 requests | Pass | Same setup with 100 simultaneous requests. Exactly 3 reservations succeed; all results settle within the 4-attempt retry limit and no oversell occurs. |
| Concurrency stress: 1000 requests | Pass | Same setup with 1000 simultaneous requests. Exactly 3 reservations succeed; all results settle within the 4-attempt retry limit and no oversell occurs. |
| Countdown upcoming, active, and ended states | Pass | Pure timestamp tests in `tests/flashSaleCountdown.test.mjs` cover before start, exact start, active countdown, exact end, and past deadline. |
| Delayed callback / suspended tab / changed clock | Pass (Node/mock) | Countdown is recomputed from supplied timestamps after a simulated time jump; a backwards clock reading is also passed through the pure calculation. This does not reproduce browser throttling or an OS clock change. |
| Animation frame cleanup and single-loop behavior | Pass (mock) | `tests/countdownAnimationLoop.test.mjs` uses a mocked scheduler for cleanup, stale callbacks, terminal state, and StrictMode-style setup/cleanup/setup. |
| React state update frequency and actual StrictMode rerenders | Not Tested | Source uses display equality before setting countdown state, and keeps engines in a lazy state initializer. No mounted React renderer, browser, FPS trace, or React DevTools measurement was available. |
| Responsive layout, keyboard interaction, and browser-visible statuses | Not Tested | No browser executable or browser automation dependency was available; these need manual or browser-based verification. |
| Cross-browser, multi-device, and server concurrency | Not Tested | The engine stress tests exercise one Node JavaScript runtime only; there is no backend or shared database in this project. |

## M6-02 review results

| Check | Result | Method and evidence |
| --- | --- | --- |
| Buy Now, reservation, checkout, cancel, payment failure, and expiration workflow | Pass (Node + static review) | Existing and M6-01 integration tests cover the engine transitions; source review confirms the page routes the product ID and reservation ID to that product's engine and syncs snapshots after operations. |
| Expiration updates inventory and visible reservation state | Pass (Node + static review) | The page scans every product engine using `Date.now()` on a 500 ms interval, syncs snapshots on version changes, and reports expired reservation IDs. Expiration/domain tests pass; actual rendered update timing was not observed in a browser. |
| Buy Now disabled before start, after end, and when sold out | Pass (static review + domain tests) | Product button is disabled when phase is not `active` or available stock is zero. Countdown/domain tests cover phase boundaries. DOM disabled state was not inspected in a browser. |
| Countdown uses wall-clock timestamps and recovers after delayed callbacks | Pass (source + Node/mock) | Each animation callback obtains the scheduler's current time (`Date.now()` in production) and recalculates from sale timestamps. Mock tests advance time between callbacks and test cleanup; no real tab suspension or system clock change was performed. |
| Inventory engine stability on rerender and StrictMode | Pass (static review; lifecycle Not Tested) | `FlashSalePage` stores the engine map in lazy state rather than constructing it during ordinary renders. `main.tsx` enables `StrictMode`. No mounted React lifecycle test was available to observe actual development double invocation or rerenders. |
| RAF, interval, callback cleanup | Pass (source + mock) | Countdown effect returns the animation loop's stop function; expiration effect clears its interval. Mock RAF tests verify cancellation, stale callback behavior, and setup/cleanup/setup leaves one scheduled loop. Actual browser unmount was not tested. |
| Responsive layout at 320, 375, 768, and 1280 px | Not Tested (static CSS review only) | CSS defines narrow, mobile, tablet, and wide grid rules, but no browser/viewport renderer was available to inspect overflow or visual layout at these exact widths. |
| Semantic HTML and accessible control names | Pass (static source review) | Page uses `main`, `header`, `nav`, `section`, `article`, `footer`, native anchors and buttons, headings, live status text, and progress labels. Reservation action buttons now include the reservation ID in their accessible names. |
| Keyboard navigation and focus-visible behavior | Pass (static CSS/source review); keyboard interaction Not Tested | Native anchors/buttons are used and `a:focus-visible`/`button:focus-visible` rules are present. Keyboard operation and visible focus were not exercised in a browser. |
| Browser console, React warnings, runtime errors, FPS, Lighthouse, accessibility tooling | Not Tested | No browser executable, browser automation, or measurement tool was available. No claims are made for these checks. |

## Stress test scope

Each stress case begins with `totalQuantity = 3`, `reservedQuantity = 0`, and `soldQuantity = 0`. Every unique request reads version 0, requests one unit, and uses `maxAttempts = 4`. The tests assert that exactly three requests reserve successfully, inventory version matches the committed holds, all results settle within the retry bound, and `soldQuantity + reservedQuantity <= totalQuantity`. The runs validate the in-memory engine's behavior; they are not throughput benchmarks or a guarantee across separate runtimes.

## Limitations and remaining checks

- Run the app in a real browser and manually inspect upcoming/active/ended sale states, responsive breakpoints at 320/375/768/1280 px, keyboard focus, and reservation/checkout feedback.
- Verify actual React mount/unmount and StrictMode behavior in a browser or DOM test environment, including that visible countdown updates happen only when the displayed second or phase changes.
- Inspect browser console and runtime behavior. No FPS, Lighthouse, or automated accessibility measurement was performed.
- Browser-based verification remains pending; this does not block the M6 work that could be performed in the available Node/static-review environment.
