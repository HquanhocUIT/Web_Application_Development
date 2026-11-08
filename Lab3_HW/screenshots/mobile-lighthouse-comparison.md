# Mobile Lighthouse comparison

Both runs used Lighthouse 12.8.2 against the production preview at `http://127.0.0.1:4174/`, with simulated mobile throttling and a 412 × 823 mobile viewport. Raw HTML and JSON reports and browser screenshots are saved beside this file.

## Scores

| Run | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Before optimization | 100 | 100 | 96 | 100 |
| After optimization | 100 | 100 | 100 | 100 |

The reported Performance score of 42 was not reproducible in the local production audit. The actual before report is preserved as `before-mobile.report.json` and `before-mobile.report.html`.

## Findings and changes

- The before report's only Best Practices failure was `font-size`: 54.57% of page text met the 12px legibility threshold. Small labels, captions, and status text were raised to at least 12px. The after audit reports 100% legible text.
- The meter now updates inside its own component. While the audio engine is idle, unchanged `-60 dBFS` readings do not re-render the drum kit, hit history, or pads every 100ms.
- AudioContext creation remains lazy until a pad is activated. There are no audio-file or custom-font network requests; the app uses generated Web Audio and system font fallbacks.
- Both reports show FCP 1.2s, LCP 1.4s, Speed Index 1.2s, TBT 0ms, and CLS 0. Lighthouse estimates 42KiB of unused JavaScript and 150ms of render-blocking savings, but those findings did not reduce the measured Performance score. The unused CSS audit passed.
- `errors-in-console` passed in both runs. Lighthouse used a clean headless Chrome session, and no app or extension console errors were reported.

## Saved evidence

- Before: `before-mobile.report.html`, `before-mobile.report.json`, `before-mobile-results.png`
- After: `after-mobile.report.html`, `after-mobile.report.json`, `after-mobile-results.png`
- Production preview UI at 375px: `after-mobile-ui-375px.png`
