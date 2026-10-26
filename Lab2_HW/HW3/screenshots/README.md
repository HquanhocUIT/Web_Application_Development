# Flash Sale Screenshots

## Captured in this run

These six PNG files are actual screenshots of the HW3 app captured from Microsoft Edge headless through Chrome DevTools Protocol after starting the Vite development server:

- `01-flash-sale-ui.png` — active sale, countdown, products, stock, and disabled sold-out item.
- `02-reservation.png` — reservation created with Buy Now; available stock and reservation expiry are visible.
- `03-checkout.png` — successful checkout feedback.
- `04-cancellation.png` — cancelled reservation feedback after its held quantity was released.
- `05-expiration.png` — automatic expiration after waiting for the real 30-second reservation TTL.
- `07-responsive.png` — 375 px viewport screenshot. The capture script also checked horizontal overflow at 320, 375, 768, and 1280 px.

The browser automation in `capture_browser.mjs` uses only Node built-ins and the browser's CDP interface. To reproduce the app captures on Windows:

1. In one terminal, from the HW3 folder, run `npm.cmd run dev -- --host 127.0.0.1`.
2. In a second terminal, launch Edge with remote debugging enabled on port 9223. Use a separate temporary profile so the normal Edge profile is not reused:

   ```powershell
   $profilePath = Join-Path (Get-Location) '.m7-edge-profile'
   Start-Process -FilePath 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -WindowStyle Hidden -ArgumentList @('--headless=new', '--no-sandbox', '--disable-gpu', '--disable-software-rasterizer', '--disable-extensions', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9223', "--user-data-dir=$profilePath", 'http://127.0.0.1:5173/')
   ```

3. Run `node screenshots/capture_browser.mjs`. It checks the browser interactions and rewrites the six app screenshots. The expiration case waits 30 seconds for the reservation TTL.

## Stress-test screenshot still needed

`06-stress-test.png` was not created because this environment does not provide a screenshot capture facility for its terminal. No image was synthesized. To capture real terminal evidence on your machine:

1. In a visible PowerShell terminal at the HW3 folder, run `node --experimental-strip-types --test --test-name-pattern="1000 simultaneous" tests/inventoryStress.test.mjs`.
2. Confirm the `1000 simultaneous requests cannot oversell limited stock` case passes.
3. Use Windows Snipping Tool (`Win+Shift+S`) to capture the actual terminal output and save it here as `06-stress-test.png`.

The complete stress suite for 10, 100, and 1000 requests also runs with `node --experimental-strip-types --test tests/*.test.mjs`; its test results are recorded in `../TEST_RESULTS.md`.
