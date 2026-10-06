# TASK DECOMPOSITION

## HW1: Production Portfolio

### M1: WCAG 2.2 AA Audit
- Task M1-01: Check color contrast.
- Task M1-02: Add semantic landmarks.
- Task M1-03: Verify heading structure.
- Task M1-04: Check alt text and labels.
- Commit: `fix(a11y): contrast & landmarks`

### M2: Focus Trap Audit
- Task M2-01: Check keyboard navigation.
- Task M2-02: Verify Tab / Shift+Tab flow.
- Task M2-03: Prevent keyboard focus traps.
- Task M2-04: Verify visible focus states.
- Commit: `fix(nav): keyboard trap prevention`

### M3: Strict CSP & Zero Inline Handlers
- Task M3-01: Remove all inline event handlers.
- Task M3-02: Replace `onclick` with addEventListener.
- Task M3-03: Add strict Content Security Policy.
- Task M3-04: Verify no inline JavaScript remains.
- Commit: `security: enforce strict CSP`

### M4: Lighthouse 100 Audit
- Task M4-01: Optimize images and assets.
- Task M4-02: Minimize render-blocking resources.
- Task M4-03: Improve loading performance.
- Task M4-04: Run Lighthouse final audit.
- Commit: `perf: optimize assets`