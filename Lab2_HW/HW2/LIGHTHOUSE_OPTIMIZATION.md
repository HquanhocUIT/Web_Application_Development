# Lighthouse Performance Review

## Baseline supplied by the project owner

The Lighthouse run reported these scores and metrics:

| Category or metric | Baseline |
| --- | ---: |
| Performance | 56/100 |
| Accessibility | 100/100 |
| Best Practices | 100/100 |
| SEO | 91/100 |
| First Contentful Paint | 11.3 s |
| Largest Contentful Paint | 20.6 s |
| Total Blocking Time | 10 ms |
| Cumulative Layout Shift | 0 |

The exact Lighthouse report, browser version, tested server, throttling settings, and failed audit list were not provided. The numbers above are recorded as owner-reported results; they are not an independently captured baseline.

## Production build and preview

- `npm run build` passed with TypeScript and Vite.
- `npm run preview -- --host 127.0.0.1` served the production build at `http://127.0.0.1:4173/`.
- The preview page and built JavaScript, CSS, and public audio file returned HTTP 200.
- Production asset sizes from the build:

  | Asset | Raw size | Gzip estimate from Vite |
  | --- | ---: | ---: |
  | JavaScript bundle | 233.68 kB | 72.97 kB |
  | CSS bundle | 5.15 kB | 1.73 kB |
  | HTML | 0.50 kB | 0.31 kB |

- The local Vite preview responses did not include `Content-Encoding`, so the assets were served uncompressed by this preview server. This does not establish how a deployed production host serves them.
- Lighthouse could not be run in this environment: no Lighthouse CLI is installed locally or globally, and prior HW2 browser checks recorded Chrome and Edge headless GPU-process startup failures. Therefore there is no measured post-change score or browser trace.

## Findings and evidence

### Findings that can be confirmed from source/build

- The initial document has a descriptive title, a meta description, `lang="en"`, and a viewport meta tag. The title and description could be more specific, but the provided Lighthouse audit details do not identify metadata as the cause of the SEO score of 91. No metadata change was made based on a guess.
- The app uses system fonts; there are no `@font-face` declarations or remote font requests. CSS is about 5.15 kB in the production build, with no large stylesheet or third-party render-blocking resource.
- The initial page is client-rendered: `index.html` starts with an empty `#root`, then the React module renders the interface. This makes first visible app content depend on loading and executing the JavaScript bundle. It is a confirmed architectural dependency and a possible contributor to FCP, but the available data does not prove it caused the reported 11.3-second FCP.
- The main JavaScript bundle contains the app and its required React/audio functionality. Its size is 233.68 kB raw and 72.97 kB gzip estimated. This is measurable, but without a Lighthouse trace or network profile it cannot be identified as the cause of the reported delay.
- `AudioDecoder` is constructed in the app effect after React mounts. `AudioContext` is created lazily only when an audio task is processed or a playback pipeline is requested. No `AudioContext` is created just to show the initial screen.
- `AudioVisualizer` is present in the initial React tree, but when its analyser is null it renders a static empty state and does not start `requestAnimationFrame`. During playback it draws to Canvas without updating React state on every frame.
- `public/test-audio.mp3` is 4,252,416 bytes and is copied to the build output. It is not referenced by the app source or initial HTML and is not requested on page load; it is fetched only if the user enters its URL. It is currently an untracked local file and was not changed or staged.
- The user-provided TBT is 10 ms and CLS is 0. These values do not show a large blocking task or layout shift, though they do not identify the cause of the high FCP/LCP.

### Unconfirmed causes

- The reported FCP/LCP may depend on the original run using the Vite development server, local machine load, browser startup, network throttling, or another Lighthouse setting. The server and trace for that run are unknown, so none of these can be confirmed.
- FCP and LCP are not measurable through the available shell-only production preview checks. The headless browser limitation and missing Lighthouse runner prevent attributing the reported timings to a specific application resource.
- The SEO score of 91 cannot be diagnosed without the failing Lighthouse audit names. Current HTML metadata checks by source inspection pass the basic presence checks, but that is not a Lighthouse SEO verification.

## Changes made

No application code, CSS, metadata, dependencies, or audio behavior were changed. The current evidence did not confirm an application defect that explains the reported FCP/LCP or SEO score. This report records the production bundle measurements and the limits on diagnosis instead of applying speculative changes that could affect the interface or audio features.

## Verification after review

- Production build: **Pass** (`npm run build`).
- Production preview: **Pass**; page and checked assets returned HTTP 200.
- Lighthouse after review: **Not measured**; Lighthouse CLI unavailable and browser startup limitations are documented above.
- Accessibility, Best Practices, SEO, FCP, LCP, TBT, and CLS after review: **Not remeasured**. The original scores remain owner-reported baseline only.
- Source checks: no unnecessary external fonts, images, or scripts found; no eager `AudioContext` creation or visualizer animation on the empty state found.

## Remaining work

1. Run Lighthouse against `npm run preview` in a working browser and save the report (including failed audit names and environment details).
2. Compare the same browser, device emulation, throttling, and server conditions against the owner-reported baseline.
3. Use the Performance/Lighthouse trace to identify whether the delay comes from app JavaScript, local server transfer, browser startup, or the test environment before making performance changes.
4. Review the exact failed SEO audits before changing metadata or adding crawl-related files.

No 100/100 score is claimed. No screenshot or Lighthouse result was fabricated.
