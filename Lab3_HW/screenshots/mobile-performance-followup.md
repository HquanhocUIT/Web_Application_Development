# Mobile Lighthouse follow-up

Audits used Lighthouse 12.8.2 against the production preview (`npm run build` then `npm run preview`) with Lighthouse's simulated Moto G Power mobile profile at 412 × 823. The reported score of 71 was not reproducible in these local runs: the initial production audit and the final audit both scored 100 in all categories.

## Scores and metrics

| Production run | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Before the accessible-name fix | 100 | 100 | 100 | 100 | 1.3 s | 1.4 s | 0 ms | 0 | 1.3 s |
| Final | 100 | 100 | 100 | 100 | 1.3 s | 1.4 s | 30 ms | 0 | 1.9 s |

TBT and Speed Index varied between runs while the category scores and other metrics stayed stable. Lighthouse's final report also warns that the test host CPU was slower than its expected calibration. Treat small timing differences as local-run variance; the reports preserve the raw measurements.

## Findings and changes

- The reported Performance score of 71 did not reproduce. Both production reports score 100. LCP is the page heading (`Find your rhythm.`); its final render delay was about 514 ms. FCP was 1.3 s and CLS was 0.
- The final FCP sub-audit scored 0.98 at 1.3 s. Lighthouse also estimates 42 KiB of unused JavaScript in the 71 KiB transferred JS bundle and 150 ms from the 2.9 KiB stylesheet being render-blocking; its network-dependency-tree insight is also flagged. These signals did not lower the aggregate Performance score in this run. Unused CSS passed. The app has no remote font or audio requests, third-party scripts, or large images. Audio is synthesized through Web Audio after interaction.
- The initial report exposed a serious label-content mismatch on the seven pads even though the Accessibility category rounded to 100. The explicit `aria-label` overrode the visible text; it was removed so the native button name comes from the visible key/name/type text. The decorative arrow is now an aria-hidden SVG. In the final report, that audit is not applicable and Accessibility remains 100.
- Lighthouse `errors-in-console` passed. A separate production browser session had no page console errors. At a 375 px mobile viewport, the document width and scroll width were both 375 px, the pad grid had two columns, all seven pads worked by mouse and keyboard, hit history populated, and the meter reached -23 dBFS after sound activity.

## Evidence

- Baseline: `mobile-optimization-before.report.html` and `.json`; score screenshot: `mobile-optimization-before-lighthouse.png`.
- Repeated baseline: `mobile-optimization-repeat.report.html` and `.json`.
- Final: `mobile-optimization-final.report.html` and `.json`; score screenshot: `mobile-optimization-final-lighthouse.png`.
- Final Lighthouse viewport capture: `mobile-optimization-final-ui.jpg`.
- Final 375 px interface with populated history and active meter: `mobile-optimization-final-375px.png`.
