# AI Failure Audit

## Scope and findings

This shared folder contains Homework 1, Homework 2 and Homework 3. The first three verified defects below belong to the AI-generated Homework 1 Drum Kit and were fixed in commit `c02bc1f`; they are not piano bugs. Homework 3 has three additional, Lighthouse-verified accessibility defects documented below. Review of the Homework 2 history (`2821898`, `3ffab41`, `bb76236`, `0b6e342`) found no separate AI-generated defect with enough test, browser, or fix-commit evidence to report. I have not counted unverified suspicions as bugs.

The Homework 2 review recorded in commit `9238623` found a submission gap: `src/App.tsx` mounted only the Drum Machine, and the Piano directory had no generated 88-key keyboard or mounted piano screen. This was a missing feature, not a verified AI-generated bug. The route and initial Piano screen were added in `c779a54`; the current redesign adds a reusable, tested `PianoKeyboard` and a scrollable studio layout.

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

## Homework 3: KRAFTON x PUBG Vietnam Arena

The three defects below were found in the HW3 production mobile Lighthouse baseline and fixed in commit `472926c`. The baseline scored 96 in Accessibility and 96 in Best Practices; after the fixes, Mobile Lighthouse scored 100 in all four categories. The original findings and metrics are recorded in the T04.2 acceptance entry in `TASK_DECOMPOSITION.md`.

### 4. Muted UI labels failed WCAG contrast

- **Affected files:** `src/homeworks/PUBGArena/PUBGArena.module.css`, `src/homeworks/PUBGArena/components/LeaderboardPanel.module.css`, `src/homeworks/PUBGArena/components/RewardCard.module.css`.
- **What went wrong:** Several gray labels did not meet the 4.5:1 contrast requirement for normal text. Lighthouse measured examples at 4.17:1 for overview labels, 3.51:1 for the season label and 3.45:1 for the points hint.
- **How it was found:** The production Mobile Lighthouse baseline failed the `color-contrast` accessibility audit.
- **Why the generated code was incorrect:** The dark theme used muted text colors selected for appearance without checking the contrast ratio against each card background.
- **How it was fixed:** Raised the text contrast for the affected overview, leaderboard and reward labels while retaining the dark color scheme.
- **Evidence:** Commit `472926c` contains the color changes. The final Mobile Lighthouse Accessibility score is 100 with no weighted accessibility audit failures; the 64-test suite, lint, typecheck and build pass.

### 5. Accessible names omitted visible button and brand labels

- **Affected files:** `src/homeworks/PUBGArena/components/RewardCard.tsx`, `src/homeworks/PUBGArena/components/ChampionshipHeader.tsx`, `src/App.test.tsx`, `src/homeworks/PUBGArena/PUBGArena.test.tsx`.
- **What went wrong:** The header link's `aria-label` replaced its visible brand text, and claim buttons had names such as “Claim Grand Finals VIP Pass” while their visible warmup label said “CLAIMS OPEN WHEN LIVE”.
- **How it was found:** The production Mobile Lighthouse baseline failed `label-content-name-mismatch` for the brand link and all four claim buttons.
- **Why the generated code was incorrect:** Explicit accessible names did not include the controls' visible text, which can make voice-control and speech-input labels inconsistent with what users see.
- **How it was fixed:** Removed the redundant brand `aria-label`; claim buttons now build their accessible names from the actual visible action label plus the reward name. Tests assert the resulting role names.
- **Evidence:** Commit `472926c` contains the code and regression-test updates. All 64 tests pass, and final Mobile Lighthouse Accessibility is 100.

### 6. Small text was not legible at mobile size

- **Affected files:** `src/homeworks/PUBGArena/PUBGArena.module.css`, `src/homeworks/PUBGArena/components/AirdropCountdownPanel.module.css`, `src/homeworks/PUBGArena/components/ChampionshipHeader.module.css`, `src/homeworks/PUBGArena/components/LeaderboardPanel.module.css`, `src/homeworks/PUBGArena/components/RewardCard.module.css`, `src/homeworks/PUBGArena/components/RewardGrid.module.css`.
- **What went wrong:** Many mobile labels used 7–11px type. Lighthouse found only 36.76% of the page text at 12px or larger and failed its legible-font-size Best Practices audit.
- **How it was found:** The production Mobile Lighthouse baseline reported Best Practices 96 and identified the high-coverage footnote, eyebrows, claim labels and metric labels as undersized.
- **Why the generated code was incorrect:** The typography scaled down small uppercase labels to preserve the compact dashboard composition, reducing readability on mobile.
- **How it was fixed:** Raised the affected functional labels and supporting text to at least 12px and adjusted responsive rules to retain fit.
- **Evidence:** Commit `472926c` contains the responsive typography changes. The final Mobile Lighthouse Best Practices score is 100; production Chrome reported no horizontal page overflow at 375px or 1440px.

The HW3 timer and claim implementation were also reviewed. Tests verified absolute-time countdown behavior, visibility synchronization, all four phases, 409 rollback, duplicate prevention, concurrent inventory, cancellation and stale-response protection. No separate timer-drift or claim-race defect was confirmed, so none is presented here as a bug.

## Verification

- Homework 1 verification: `npm run lint`, `npm run typecheck`, `npm test` (7 tests), and `npm run build` pass. Its final Lighthouse scores were Performance 100, Accessibility 100, Best Practices 100 and SEO 100.
- Homework 3 verification: 64 automated tests pass; lint, typecheck and production build pass. Final Mobile Lighthouse scores were Performance 100, Accessibility 100, Best Practices 100 and SEO 100.
- Browser screenshots and the Lighthouse HTML/JSON report are saved in `screenshots/`.
- Homework 1 screenshots and Lighthouse artifacts referenced above predate the Homework 3 work. No screenshot was created for the HW3 verification.
- Homework 3 has six meaningful atomic commits: WBS, project rules, dashboard, countdown, claims/leaderboard and accessibility fixes (`de4b004`, `d3b3011`, `5e6efce`, `bf04e8c`, `2f14f3d`, `472926c`). No placeholder commits were added to inflate the count.
