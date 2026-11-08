# AI Failure Audit

These three defects were found in the AI-generated Homework 1 implementation during browser and Lighthouse review. Their fixes are in commit `c02bc1f`.

## 1. Global page styles were placed in a CSS Module

- **What went wrong:** `:global(*)`, `:global(html)` and `:global(body)` in `src/App.module.css` were not emitted by the build. The browser kept its default body margin and content-box sizing, which made the 375px layout overflow horizontally.
- **How it was found:** A Chrome DevTools viewport check at 375px measured a 377px document width; inspection showed the base selectors were absent from the built CSS.
- **How it was fixed:** Moved the global reset into `src/global.css`, imported from `src/main.tsx`, and kept component styling in CSS Modules.
- **Evidence:** After the fix, Chrome reported `innerWidth`, `clientWidth`, and `scrollWidth` all equal to 375. The production build passes.

## 2. The app had no favicon

- **What went wrong:** Browsers requested `/favicon.ico`, which returned 404 and appeared as a console error in Lighthouse.
- **How it was found:** The initial Lighthouse Best Practices score was 96; its `errors-in-console` audit identified the missing icon request.
- **How it was fixed:** Added `public/favicon.svg` and linked it from `index.html`.
- **Evidence:** The final `screenshots/lighthouse-report.report.json` gives `errors-in-console` a passing score and Best Practices 100. The production preview serves `/favicon.svg` successfully.

## 3. The app had no valid `robots.txt`

- **What went wrong:** A request to `/robots.txt` fell through to the Vite app page, so crawlers received HTML instead of robots directives.
- **How it was found:** The initial Lighthouse SEO score was 91; its `robots-txt` audit reported 18 syntax errors in the returned HTML.
- **How it was fixed:** Added `public/robots.txt` with `User-agent: *` and `Allow: /`.
- **Evidence:** The final Lighthouse JSON marks `robots-txt` as passing and SEO 100. The production preview serves the two valid directives.

## Verification

- `npm run lint`, `npm run typecheck`, `npm test` (7 tests), and `npm run build` pass.
- Final Lighthouse scores: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Browser screenshots and the Lighthouse HTML/JSON report are saved in `screenshots/`.
