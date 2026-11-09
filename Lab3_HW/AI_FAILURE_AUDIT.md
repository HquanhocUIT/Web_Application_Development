# AI Failure Audit

## Scope and findings

This folder contains both Homework 1 and Homework 2. The three verified defects below were found in the AI-generated Homework 1 Drum Kit and fixed in commit `c02bc1f`; they are not piano bugs. Review of the Homework 2 history (`2821898`, `3ffab41`, `bb76236`, `0b6e342`) found no separate AI-generated defect with enough test, browser, or fix-commit evidence to report. I have not counted unverified suspicions as bugs.

The final Homework 2 review also found a submission gap: `src/App.tsx` still mounts the Drum Machine, and the Piano directory has no generated 88-key keyboard or mounted piano screen. This is an incomplete feature, not a verified AI-generated bug, so it is reported here as a limitation rather than added to the defect count.

The three existing, evidence-backed Homework 1 defects are retained below to preserve the audit history for this shared project folder.

## 1. Global page styles were placed in a CSS Module

- **Affected files:** `src/App.module.css` (later moved to `src/global.css`), `src/main.tsx`.
- **What went wrong:** `:global(*)`, `:global(html)` and `:global(body)` in `src/App.module.css` were not emitted by the build. The browser kept its default body margin and content-box sizing, which made the 375px layout overflow horizontally.
- **How it was found:** A Chrome DevTools viewport check at 375px measured a 377px document width; inspection showed the base selectors were absent from the built CSS.
- **How it was fixed:** Moved the global reset into `src/global.css`, imported from `src/main.tsx`, and kept component styling in CSS Modules.
- **Why the generated code was incorrect:** CSS Module scoping does not emit the attempted `:global(...)` rules in this build setup, so the reset never reached the document-level elements.
- **Evidence:** Commit `c02bc1f` moves the reset into `src/global.css` and imports it in `src/main.tsx`. After the fix, Chrome reported `innerWidth`, `clientWidth`, and `scrollWidth` all equal to 375; the production build passes.

## 2. The app had no favicon

- **Affected files:** `index.html`, `public/favicon.svg`.
- **What went wrong:** Browsers requested `/favicon.ico`, which returned 404 and appeared as a console error in Lighthouse.
- **How it was found:** The initial Lighthouse Best Practices score was 96; its `errors-in-console` audit identified the missing icon request.
- **How it was fixed:** Added `public/favicon.svg` and linked it from `index.html`.
- **Why the generated code was incorrect:** The generated page metadata omitted a favicon, leaving the browser's default icon request unresolved.
- **Evidence:** The final `screenshots/lighthouse-report.report.json` gives `errors-in-console` a passing score and Best Practices 100. The production preview serves `/favicon.svg` successfully.

## 3. The app had no valid `robots.txt`

- **Affected files:** `public/robots.txt`.
- **What went wrong:** A request to `/robots.txt` fell through to the Vite app page, so crawlers received HTML instead of robots directives.
- **How it was found:** The initial Lighthouse SEO score was 91; its `robots-txt` audit reported 18 syntax errors in the returned HTML.
- **How it was fixed:** Added `public/robots.txt` with `User-agent: *` and `Allow: /`.
- **Why the generated code was incorrect:** No robots file existed, and the SPA fallback returned the application document for the crawler path.
- **Evidence:** The final Lighthouse JSON marks `robots-txt` as passing and SEO 100. The production preview serves the two valid directives.

## Verification

- `npm run lint`, `npm run typecheck`, `npm test` (7 tests), and `npm run build` pass.
- Final Lighthouse scores: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Browser screenshots and the Lighthouse HTML/JSON report are saved in `screenshots/`.
- The verification and Lighthouse evidence above belong to Homework 1. This final Homework 2 documentation pass does not add or capture screenshots.
- Homework 2 has four meaningful commits in its own history so far; the shared `Lab3_HW` history includes the earlier Homework 1 commits as well. No placeholder commits were added to inflate either count.
