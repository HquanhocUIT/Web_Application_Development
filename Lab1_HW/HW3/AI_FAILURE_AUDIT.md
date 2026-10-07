# AI Failure Audit

## Defect 1

### 1. Defect Description
The form state machine treated `SUCCESS` and `ERROR` as terminal states, but the submit button was enabled again after those states.

This caused an invalid transition when the user tried to submit again:
error -> submitting

### 2. Diagnostic Method
Submit the form until it reaches SUCCESS or ERROR, then click Register again.
The browser console shows an invalid state transition, proving that the UI behavior and state machine rules are inconsistent.

### 3. Refactored Solution
Allow retry transitions from SUCCESS and ERROR back to SUBMITTING, or transition the form back to IDLE before another submit.

## Defect 2

### 1. Defect Description
The initial mock submission used `Promise.resolve()`, so the `Submitting` state finished almost immediately.

Because of this, it was difficult to observe the `Submitting` UI and verify the double-submit prevention behavior.

### 2. Diagnostic Method
The form was submitted repeatedly during testing.

The `Submitting...` state disappeared too quickly to test repeated clicks reliably. A temporary delay was later required in M3-03 to verify that only one submission process was executed.

### 3. Refactored Solution
Use a temporary asynchronous delay during testing so the `Submitting` state remains visible long enough to verify the behavior.

Example:

```js
await new Promise((resolve) => {
  setTimeout(resolve, 2000);
});

## Defect 3

### 1. Defect Description
The initial form setup called `setFormState(FORM_STATES.IDLE);` while `formState` was already initialized as `IDLE`.

Because `setFormState()` returned immediately when the next state matched the current state, the initial UI setup inside the function was skipped.

### 2. Diagnostic Method
The `setFormState()` logic was reviewed during state transition verification.

The condition `if (nextState === formState) { return; }` was found inside the function.

Since the initial state was already `IDLE`, calling `setFormState(FORM_STATES.IDLE)` returned immediately and did not execute the UI update logic.

### 3. Refactored Solution
Initialize the Idle UI directly instead of treating initialization as a state transition.

Use `registrationForm.dataset.state = formState`, set `submitButton.disabled = false`, set the button text to `Register`, and clear `formStatus`.

This separates the initial UI setup from actual state transitions and avoids unnecessary `IDLE -> IDLE` transitions.