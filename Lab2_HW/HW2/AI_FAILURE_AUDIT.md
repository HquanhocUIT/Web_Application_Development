# AI Failure Audit

This report records three real implementation problems found while building HW2. The first two were caught and fixed during the M4 coding session before they were committed. Their original compiler/linter output was observed in that session but was not saved as a repository log. The third is visible in the parent and M4 commit diffs.

## Failure 1: Rendering an `unknown` task error

1. **Related prompt:** M4-01 asked to show task states and clear error messages in the queue.
2. **Problematic AI code:** The first UI draft used a truthy check like `task.error && <span>{getErrorMessage(task.error)}</span>`. `task.error` has type `unknown`, so TypeScript could not use it as a valid React child.
3. **Problem and risk:** The application did not pass its TypeScript production build. Leaving this in place would prevent a valid build.
4. **Detection:** `npm run build` reported `TS2322` in `src/App.tsx`: `Type 'unknown' is not assignable to type 'ReactNode'`.
5. **Fix:** Check the error against the queue's null sentinel and render only the string returned by `getErrorMessage`:

   ```tsx
   {task.error !== null && task.status === 'failed' && (
     <span className="task-error">{getErrorMessage(task.error)}</span>
   )}
   ```

6. **Verification:** A later `npm run build` passed. The corrected check is present in `src/App.tsx`. The original compiler output was not saved as a file, so this entry relies on the M4 implementation-session output and the current corrected source.

## Failure 2: Synchronous state update inside an effect

1. **Related prompt:** M4-01 asked to connect the queue snapshot to the React interface.
2. **Problematic AI code:** The first effect synchronously called `setQueueSnapshot(queue.getSnapshot())` when it set up the queue, in addition to updating state from the queue's `onChange` callback.
3. **Problem and risk:** The initial snapshot was already `EMPTY_QUEUE`; the synchronous effect update was redundant and triggered the `react(set-state-in-effect)` lint warning.
4. **Detection:** `npm run lint` reported the `react(set-state-in-effect)` warning during M4 implementation.
5. **Fix:** Removed the redundant initial state update. The component starts from `EMPTY_QUEUE` and updates the React state when the queue reports a change through `onChange`.
6. **Verification:** The later `npm run lint` passed without warnings. The corrected effect is in `src/App.tsx`. As with Failure 1, the initial lint output was observed during implementation but was not saved as a repository log.

## Failure 3: Playback nodes retained resources after stopping or ending

1. **Related prompt:** M4-01 requested Play/Stop controls; M4-02 explicitly required cleanup after Stop, natural playback end, replacement playback, and decoder cleanup.
2. **Problematic AI code:** Before the M4 fix, `createPlaybackPipeline()` connected an `AudioBufferSourceNode` and `AnalyserNode`, but `stop()` only stopped/disconnected the nodes. It did not clear `source.onended` or `source.buffer`, and `AudioDecoder.cleanup()` did not track and stop pipelines it had created.
3. **Problem and risk:** A retained callback or `AudioBuffer` reference could keep resources alive. A pipeline could also remain active when the decoder was cleaned up.
4. **Detection:** M4 lifecycle review compared the pre-fix code with the cleanup requirements. The code change is inspectable in commit `882931d` (`feat: complete audio controls and resource cleanup`): it adds pipeline tracking, release on natural end and stop, clears the callback and buffer, and stops tracked pipelines during decoder cleanup.
5. **Fix:** `AudioDecoder` now tracks pipelines in a `Set`; `releasePlaybackNodes()` clears `source.onended`, disconnects both nodes, and sets `source.buffer = null`. Natural end, explicit stop, and decoder cleanup release the pipeline.
6. **Verification:** M5-01 mock regression checks passed for Stop, replacement playback, natural end, disconnecting source/analyser nodes, releasing the buffer and callback, and decoder cleanup. These are mock results; real browser audio playback remains unverified.

## Environment limitation (not an AI failure)

Chrome and Edge headless both failed before rendering because their GPU process exited with code `-1073741790`. Node.js in this environment does not provide a browser DOM or a real `AudioContext`. This prevented real browser interaction, real audio playback checks, viewport screenshots, DevTools memory checks, and measured FPS. These limits are recorded in `TEST_RESULTS.md`; they are not counted as AI-generated application defects. The `screenshots/` folder currently has an explanatory README only and no real screenshots.

## Evidence summary

- **AI implementation failures with evidence:** 3.
- **Fixed:** 3.
- **Real-browser verification of fixes:** Pending; mock regression checks cover the lifecycle fix, while browser-only checks remain listed as Not Tested in `TEST_RESULTS.md`.
- **Screenshot evidence:** Pending. No screenshot has been fabricated or reported as captured.
