# AI Failure Audit — Exercise 1.2

## Scope

Review of the implementation and verification notes recorded in this exercise's WBS.

## Findings

- **Verification gap — Lighthouse:** The WBS records source review and a successful production build, but no live browser/DevTools Lighthouse audit or numeric Lighthouse scores. Those scores remain unknown.
- **No confirmed functional failure recorded:** The WBS records lint/build success and checks for nested routing, active navigation, master-detail behavior, URL parameters, invalid IDs, 404, and the mobile layout.
- **Project boundary:** Exercise 1.2 remains a separate copy; no changes to Exercise 1.1 are recorded in its WBS.

## Follow-up

- Run Lighthouse in a browser when available and record measured scores and test conditions.
- Keep performance and accessibility observations separate from Lighthouse scores unless measured by Lighthouse.
