# TASK DECOMPOSITION — Exercise 3

**Exercise:** Resilient State Machine & Skeleton Loader  
**Technology:** React, TypeScript, HTML, CSS  
**Scope:** Work Breakdown Structure (WBS) and implementation verification.

## 1. Project Initialization

| WBS | Task | Objective | Expected Outcome |
|---|---|---|---|
| 1.1 | [x] Initialize React + TypeScript project | Establish a working development environment. | Project scaffold with Vite, React and TypeScript. |
| 1.2 | [x] Organize project folders | Separate UI, state, services, types and tests. | Clear, maintainable folder structure. |
| 1.3 | [x] Define data model and mock API contract | Standardize data shapes and fetching behavior. | Typed data interface and defined success/failure scenarios. |
| 1.4 | [x] Configure basic application shell | Prepare a single mounting point and shared styling. | App shell ready for state-based rendering. |

## 2. Four-State Machine

| WBS | Task | Objective | Expected Outcome |
|---|---|---|---|
| 2.1 | [x] Define IDLE, LOADING, SUCCESS, ERROR types | Represent each state explicitly. | Type-safe discriminated union for app states. |
| 2.2 | [x] Define state transitions and events | Prevent invalid or inconsistent transitions. | Documented FETCH, RESOLVE, REJECT and RETRY transitions. |
| 2.3 | [x] Implement reducer and initial state | Centralize state transitions. | State machine starts in IDLE and reacts predictably to events. |
| 2.4 | [x] Add state-specific rendering boundaries | Display exactly one state at a time. | UI mapping for IDLE, LOADING, SUCCESS and ERROR. |

## 3. Asynchronous Data Fetching

| WBS | Task | Objective | Expected Outcome |
|---|---|---|---|
| 3.1 | [x] Create asynchronous data service | Isolate API calls from UI components. | Typed async fetch function with success/failure behavior. |
| 3.2 | [x] Connect fetch lifecycle to state machine | Reflect request progress in UI state. | FETCH → LOADING → SUCCESS/ERROR flow. |
| 3.3 | [x] Guard against race conditions | Prevent stale responses from replacing newer results. | Request identity check and/or AbortController cancellation. |
| 3.4 | [x] Handle unmount and cleanup | Avoid updates from abandoned requests. | Safe request cleanup with no stale state updates. |

## 4. Skeleton Loader UI

| WBS | Task | Objective | Expected Outcome |
|---|---|---|---|
| 4.1 | [x] Build skeleton item components | Match the structure of the eventual data list. | Reusable skeleton placeholders. |
| 4.2 | [x] Add CSS pulse animation | Indicate active loading without layout jumps. | Smooth animated skeleton with reduced-motion support. |
| 4.3 | [x] Implement SUCCESS data list | Render fetched records accessibly. | Responsive list with stable item keys. |
| 4.4 | [x] Validate conditional rendering | Keep loading placeholders separate from actual data. | LOADING and SUCCESS never display together. |

## 5. Error Handling & Retry Connection

| WBS | Task | Objective | Expected Outcome |
|---|---|---|---|
| 5.1 | [x] Build ERROR UI | Explain failed loading clearly. | Readable error message and Retry Connection button. |
| 5.2 | [x] Implement retry transition | Allow users to restart a failed request. | ERROR → LOADING → SUCCESS/ERROR flow. |
| 5.3 | [x] Prevent duplicate or stale retry results | Keep concurrent and repeated requests consistent. | Only the latest valid response updates the UI. |
| 5.4 | [x] Improve loading and error accessibility | Communicate status to assistive technologies. | Appropriate status messaging, focus behavior and button states. |

## 6. State Testing & Verification

| WBS | Task | Objective | Expected Outcome |
|---|---|---|---|
| 6.1 | [x] Test initial and loading states | Verify IDLE and LOADING behavior. | Initial state and skeleton visibility tests pass. |
| 6.2 | [x] Test success and failure scenarios | Verify terminal states and data rendering. | SUCCESS list and ERROR UI tests pass. |
| 6.3 | [x] Test retry flow | Verify recovery after an error. | Retry triggers a fresh request and correct state transitions. |
| 6.4 | [x] Test race conditions and unmount cleanup | Detect stale updates and inconsistent UI. | Out-of-order responses cannot overwrite the latest result. |
| 6.5 | [x] Run final UI and accessibility checks | Confirm responsive and consistent rendering. | All four states render correctly without overlap or duplicate requests. |

## Execution Order

Complete **1 → 2 → 3 → 4 → 5 → 6**, confirming each milestone's expected outcomes before moving to the next. All listed tasks are verified.
