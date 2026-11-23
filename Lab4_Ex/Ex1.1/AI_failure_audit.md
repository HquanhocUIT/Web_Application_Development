# AI Failure Audit - Exercise 1.1

## Scope

Review of the implementation and verification notes recorded in this exercise's WBS.

## Findings

- **Corrected SEO issue:** Lighthouse initially reported an invalid `robots.txt` because the SPA fallback returned HTML at that URL. A valid `public/robots.txt` has been added; the production detail route now scores SEO 100.
- **Performance depends on audit settings:** The production detail route scored Performance 100 with mobile form factor and no throttling, and 100 with the desktop preset. With Lighthouse's simulated mobile CPU/network throttling it scored 99. The WBS records both settings and metrics.
- **Verification gap - ESLint:** Oxlint passed, but ESLint could not be installed because of a TypeScript/parser dependency conflict. An Oxlint pass is not reported as an ESLint pass.
- **No confirmed functional failure recorded:** Earlier WBS entries record route, lazy chunk, Suspense skeleton, responsive layout, and accessibility checks as passing.

## Follow-up

- Recheck Lighthouse after future code or content changes, using the same route and throttling settings for comparisons.
- Run ESLint when a compatible configuration can be installed; keep its result distinct from Oxlint.
