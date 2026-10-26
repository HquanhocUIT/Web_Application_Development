# Lighthouse Optimization Review

## Starting scores supplied by the user

| Category | Initial score | New score |
| --- | ---: | --- |
| Performance | 64 | Not measured |
| Accessibility | 96 | Not measured |
| Best Practices | 100 | Not measured |
| SEO | 91 | Not measured |

No Lighthouse HTML/JSON report or list of failed audits was supplied. Lighthouse CLI is not installed in HW3, the global npm packages, PATH, or the local npm cache. No package was installed for this review. The installed Edge binary was present, but the attempted CDP probe did not complete, so this review does not claim a Lighthouse run or a new score.

## Verified production build and source observations

- `npm.cmd run build` completed successfully with Vite 8.3.5.
- `npm.cmd run preview -- --host 127.0.0.1` started and the production page at `/` returned HTTP 200.
- The production build reported `index-DJGi4Ry8.js` at 246.53 kB (76.16 kB gzip) and `index-D3HK4rzl.css` at 13.01 kB (3.65 kB gzip).
- The source has no `<img>` elements or external font imports. Product illustrations use emoji and CSS gradients; the font stack is system fonts. Therefore there are no image/font downloads or third-party stylesheets blocking the initial page in the source reviewed.
- `index.html` already includes `lang="vi"`, a descriptive `<title>`, a meta description, a viewport declaration, and a data favicon. The production HTML response contains these tags.
- `App.tsx` renders the page client-side into an initially empty `#root`. Initial content therefore depends on the JS bundle executing; this is an architectural observation, not a measured cause of the reported Performance score.
- `FlashSalePage` creates its inventory engine map in a lazy `useState` initializer, so normal rerenders reuse the same map. `FlashSaleCountdown` derives values from `Date.now()` and only calls `setState` when the visible value changes. Its animation loop still checks time on each animation frame; no browser CPU profile was available to measure its cost.
- Existing UI source uses semantic landmarks, headings, native links/buttons, accessible labels and status regions. Contrast and other Lighthouse accessibility audits were not measured, so no color changes were made.

## Lighthouse score causes

The exact failed audits behind Performance 64, Accessibility 96, and SEO 91 remain unverified because the audit report and Lighthouse runner were unavailable. In particular, this review did not measure FCP, LCP, render-blocking time, main-thread work, or color contrast. It would be guesswork to attribute the scores to the bundle, countdown, metadata, or any individual color. No application changes were made on that basis.

## Console message `onboarding.js:48`

`rg` found no `onboarding.js` or `onboarding` reference in the HW3 source. The reported filename does not match a project file and may come from a browser extension or injected tooling. The isolated Edge/CDP attempt did not complete, so checking the console in a clean Incognito profile remains Pending. No application code was changed to mask the message.

## Files changed and optimization applied

- Created `LIGHTHOUSE_OPTIMIZATION.md` with this evidence-based review.
- No app source, CSS, inventory, countdown, or dependency files were changed because the specific failed audits and their impact could not be confirmed. This preserves the current UI and sale behavior.

## Checks run

- `npm.cmd run build` — Pass.
- Production preview startup and `GET /` — Pass, HTTP 200.
- Source inspection of page metadata, imported assets/fonts, app initialization, countdown loop, and engine lifecycle — completed.
- `npm.cmd run lint` — Pass.
- `node --experimental-strip-types --test tests/*.test.mjs` — Pass, 61/61, including the 10/100/1000-request stress cases.
- `git diff --check` — Pass; only Windows LF-to-CRLF normalization notices were printed.
- Lighthouse production audit and FCP/LCP measurements — Not Tested; no Lighthouse runner or usable CDP probe was available.
- Incognito console inspection for `onboarding.js:48` — Not Tested; no source match was found, but the isolated browser probe failed before reading the console.

## Pending

1. Run Lighthouse against `npm.cmd run preview` in Chrome/Edge DevTools, preferably in a clean Incognito profile with extensions disabled, and save/export the report.
2. Share or inspect the failed audit names and metric values (FCP, LCP, TBT, CLS) before making targeted code changes.
3. Recheck the `onboarding.js:48` message in that clean profile. If it disappears, attribute it to injected browser tooling; if it remains, inspect its full stack and initiator before changing application code.
4. Apply targeted changes only for confirmed audits, then compare production Lighthouse scores and rerun build, lint, Node tests, and `git diff --check`.
