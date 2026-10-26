# M6 Integration and Test Results

## Environment and commands

- Runtime: Node.js native test runner with TypeScript type stripping.
- M6 final checks: `node --experimental-strip-types --test tests/*.test.mjs` **Pass**, 61/61; `npm.cmd run build` **Pass**; `npm.cmd run lint` **Pass**; `git diff --check` **Pass** (Git only printed LF-to-CRLF normalization warnings).
- M7-01 final checks: `node --experimental-strip-types --test tests/*.test.mjs` **Pass**, 61/61; `npm.cmd run build` **Pass**; `npm.cmd run lint` **Pass**; `git diff --check` **Pass** (same line-ending warnings).
- M6 was verified with Node and mocked scheduling before the installed browser was discovered. M7-01 used Microsoft Edge 156 headless through Chrome DevTools Protocol; no DOM-based React test runner is configured. Browser results are listed separately below.
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
| React state update frequency and actual StrictMode rerenders | Not Tested at M6 | Source uses display equality before setting countdown state and keeps engines in a lazy state initializer. M7 browser interactions caused functional rerenders, but did not instrument component identity, frame counts, or React internals. |
| Responsive layout, keyboard interaction, and browser-visible statuses | Not Tested at M6 | No browser executable was found during M6. See the M7-01 headless browser results below for subsequent viewport and keyboard checks. |
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
| Responsive layout at 320, 375, 768, and 1280 px | Not Tested at M6 (static CSS review only) | CSS defines narrow, mobile, tablet, and wide grid rules. The M7-01 headless browser follow-up later measured these exact widths; see its results below. |
| Semantic HTML and accessible control names | Pass (static source review) | Page uses `main`, `header`, `nav`, `section`, `article`, `footer`, native anchors and buttons, headings, live status text, and progress labels. Reservation action buttons now include the reservation ID in their accessible names. |
| Keyboard navigation and focus-visible behavior | Pass (static CSS/source review); keyboard interaction Not Tested at M6 | Native anchors/buttons are used and `a:focus-visible`/`button:focus-visible` rules are present. M7-01 later exercised Tab and Enter in Edge; see results below. |
| Browser console, React warnings, runtime errors, FPS, Lighthouse, accessibility tooling | Not Tested at M6 | Browser tooling was not available during M6. M7-01 later checked Edge console warnings/errors; FPS, Lighthouse, and screen-reader tooling remain untested. |

## M7-01 browser verification

| Check | Result | Method and evidence |
| --- | --- | --- |
| Development server startup | Pass | Started with `npm.cmd run dev -- --host 127.0.0.1`; Vite reported ready at port 5173 and an HTTP GET for `/` returned 200. |
| Countdown display and update | Pass (headless browser) | Edge loaded the app; countdown seconds changed after a 1.2-second wait. The capture script also moved `Date.now()` before the sale start and past the sale end, confirmed phase transitions, then reloaded the page before purchase checks. |
| Buy Now and reservation | Pass (headless browser) | CDP activated an enabled Buy Now button; the UI showed a new reservation, its expiry, and stock decreasing from 12 to 11. Its screenshot was captured during M7-01 and later removed at the user's request. |
| Checkout | Pass (headless browser) | CDP activated the reservation's checkout control; the order status showed checkout success. Its screenshot was captured during M7-01 and later removed at the user's request. |
| Cancellation | Pass (headless browser) | A second reservation was cancelled; the UI reported cancellation and stock was released. Its screenshot was captured during M7-01 and later removed at the user's request. |
| Automatic expiration | Pass (headless browser) | The script waited for the actual 30-second reservation TTL and verified expiration feedback and released stock. Its screenshot was captured during M7-01 and later removed at the user's request. |
| Buy Now unavailable before/after the sale and when sold out | Pass (headless browser) | DOM `disabled` values were checked after moving `Date.now()` before/after the configured sale; the sold-out card was also checked in the active phase. |
| Responsive widths 320, 375, 768, and 1280 px | Pass (headless browser) | Edge device metrics were set to each width; `document.documentElement.scrollWidth` was 320, 360, 753, and 1265 respectively, so none exceeded its viewport. A 375 px screenshot was captured during M7-01 and later removed at the user's request. |
| Keyboard focus and purchase | Pass (headless browser) | CDP sent Tab until an enabled Buy Now button was focused, confirmed `:focus-visible`, then sent Enter and observed reservation success. The first Tab also focused the brand link with visible focus. |
| Browser console errors and runtime exceptions | Pass (headless browser) | After the favicon correction, the capture run observed no Console warning/error entries or runtime exceptions. This was a headless Edge run, not a manual desktop session. |
| Version conflict feedback through the UI | Not Tested | The engine version-conflict and retry cases pass in Node tests, but the UI exposes no test control to force a stale version. The message mapping was reviewed statically. |
| Stress-test screenshot | Not Created | Stress tests pass, including an isolated 1000-request Node run, but no terminal screenshot was captured. The local capture instructions were removed with the screenshots folder at the user's request. |
| FPS, Lighthouse, desktop browser interaction, and screen-reader testing | Not Tested | These tools or manual desktop interaction were not used. |

At the time of M7-01, six actual app screenshots were captured in Edge and the capture script reproduced the browser checks without external packages. After M7-02 was committed, the entire `screenshots` folder (including the images, script, and README) was removed at the user's request. Those artifacts are not present in the current working tree.

## Stress test scope

Each stress case begins with `totalQuantity = 3`, `reservedQuantity = 0`, and `soldQuantity = 0`. Every unique request reads version 0, requests one unit, and uses `maxAttempts = 4`. The tests assert that exactly three requests reserve successfully, inventory version matches the committed holds, all results settle within the retry bound, and `soldQuantity + reservedQuantity <= totalQuantity`. The runs validate the in-memory engine's behavior; they are not throughput benchmarks or a guarantee across separate runtimes.

## M7-02 final review

| Check | Result | Method and evidence |
| --- | --- | --- |
| AI failure audit minimum and evidence fields | Pass | Reviewed 9 real entries in `AI_FAILURE_AUDIT.md`; each records observed evidence, impact, cause, correction, and recheck. No synthetic failures were added. |
| Screenshots existed, opened, and matched their recorded states | Pass at review time; artifacts later removed | Six PNGs were enumerated, decoded with Windows System.Drawing, and visually reviewed. The whole `screenshots` directory was subsequently deleted at the user's request, so the images are no longer available in the project. |
| Stress-test screenshot `06-stress-test.png` | Not created | No screenshot was synthesized. The 10/100/1000 request stress cases themselves pass in the Node suite. The capture instructions were in the deleted screenshots README. |
| Milestone commits M0–M6 | Pass | Git history contains one non-empty Conventional Commit for each milestone: 6bc35f4, dacd0a4, bd7376d, 4696dda, 680aa25, b76d3d4, and f4155a9. M7's final documentation commit is created after this review. |
| Final build | Pass | `npm.cmd run build`; TypeScript compilation and Vite production build completed successfully. |
| Final lint | Pass | `npm.cmd run lint`; ESLint completed with exit code 0. |
| Full Node test suite | Pass | `node --experimental-strip-types --test tests/*.test.mjs`; 61 passed, 0 failed, including 10/100/1000 concurrent request cases. |
| Whitespace validation | Pass | `git diff --check`; no whitespace errors. Git may report line-ending normalization warnings for Windows checkouts. |

### Final verification limits

- Edge headless checks documented in M7-01 are real browser evidence. A non-headless/manual browser run was not performed.
- Version conflict UI was not forced in the browser; its behavior is verified by Node tests and static UI mapping.
- React DevTools lifecycle inspection, FPS measurement, Lighthouse, screen-reader testing, and actual tab suspension/OS clock changes remain Not Tested.
- The concurrency tests model one Node/JavaScript runtime and are not a multi-device or backend concurrency test.

## Limitations and remaining checks

- `06-stress-test.png` was not captured. The screenshot directory and its manual capture instructions were later deleted at the user's request.
- Verify React mount/unmount and StrictMode timer cleanup with React DevTools or a DOM test runner; the current browser run checked functional rerenders but did not instrument React internals or count animation loops.
- Version-conflict UI feedback remains verified by Node domain tests and static UI mapping, not by forcing a conflict in the browser.
- No FPS, Lighthouse, or screen-reader audit was performed.
