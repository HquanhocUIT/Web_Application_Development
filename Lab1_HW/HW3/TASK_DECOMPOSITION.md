# TASK DECOMPOSITION

## HW3: Resilient Landing Page

### M0: Initial Landing Page
- Task M0-01: Create basic HTML structure.
- Task M0-02: Create base CSS layout.
- Commit: `feat(hw3): create landing page structure`

### M1: Drift-Free Countdown Engine
- Task M1-01: Add countdown UI.
- Task M1-02: Define UTC ISO 8601 target timestamp.
- Task M1-03: Calculate remaining time using Date.now().
- Task M1-04: Render countdown values.
- Task M1-05: Verify timer does not drift.
- Commit: `feat(hw3): add drift-free countdown`

### M2: State-Machine Form
- Task M2-01: Create form UI.
- Task M2-02: Define Idle state.
- Task M2-03: Implement Submitting state.
- Task M2-04: Implement Success and Error states.
- Task M2-05: Verify state transitions.
- Commit: `feat(hw3): implement form state machine`

### M3: Double-Submit Prevention
- Task M3-01: Block submit while Submitting.
- Task M3-02: Disable submit button while request is active.
- Task M3-03: Verify repeated clicks do not create duplicate submissions.
- Commit: `fix(hw3): prevent duplicate submissions`

### M4: Input Sanitization & XSS
- Task M4-01: Audit user-controlled input rendering.
- Task M4-02: Remove unsafe innerHTML usage.
- Task M4-03: Use textContent or safe DOM APIs.
- Task M4-04: Verify common XSS payloads are rendered as text.
- Commit: `security(hw3): prevent XSS`

### M5: AI Failure Mode Audit
- Task M5-01: Document AI defect 1.
- Task M5-02: Document AI defect 2.
- Task M5-03: Document AI defect 3.
- Task M5-04: Record diagnostic method for each defect.
- Task M5-05: Record verified refactored solution.
- Commit: `docs(hw3): add AI failure audit`