# Homework 1 Project Rules

- Use React 19, Vite and TypeScript with functional components and React Hooks.
- Use semantic HTML and CSS Modules.
- Follow WCAG 2.2 AA and aim for a Lighthouse Accessibility score of 100.
- Use `e.code`; do not use `keyCode`.
- Avoid deprecated React APIs and direct state mutation.
- Clean up event listeners, timers and audio resources.
- Follow `TASK_DECOMPOSITION.md` and implement one main task at a time.
- Test before marking tasks complete.
- Commit after completing each main task.
- Do not modify the Lab 2 projects.

# Homework 2 Project Rules

- Use React 19, Vite, TypeScript and functional components.
- Use semantic HTML, CSS Modules and accessible controls.
- Generate the 88 piano keys algorithmically; never hardcode individual key elements.
- Calculate note frequency as `440 * 2 ** ((midi - 69) / 12)`.
- Use the Web Audio API for polyphonic sound.
- Track active voices in an insertion-ordered ES6 `Map`, with at most 8 active voices; steal the oldest voice when a 9th starts.
- Use `React.memo` for piano keys, with stable props and callbacks to avoid unnecessary renders.
- Use smooth `GainNode` release envelopes to prevent audio popping.
- Clean up oscillators, timers, event listeners and `AudioContext` resources.
- Use `AbortController` to cancel asynchronous sequence playback.
- Avoid deprecated React APIs, direct state mutation and unnecessary `useEffect` calls.
- Follow WCAG 2.2 AA and aim for Lighthouse Accessibility 100.
- Follow `TASK_DECOMPOSITION.md` and complete one main task at a time.
- Test each task before marking it complete; commit after each completed main task.
- Do not modify Lab 2 projects.
- Do not create a screenshots folder or capture screenshots; screenshots will be provided manually.

# Homework 3 Project Rules

- Use React 19, Vite, TypeScript and functional components.
- Use semantic HTML, CSS Modules and WCAG 2.2 AA practices.
- Prefer immutable state updates; avoid unnecessary `useEffect` calls.
- Calculate countdowns with `Date.now()` and an absolute target timestamp, not only a decrementing counter.
- Synchronize on `visibilitychange` and clean up timers and event listeners.
- Model airdrop status with `WARMUP`, `AIRDROP_LIVE`, `LOOTED_OUT` and `EXPIRED` states.
- Update inventory optimistically, roll back on HTTP 409, and prevent duplicate pending claims.
- Format VND prices with `Intl.NumberFormat('vi-VN')`.
- Use stable IDs, pure derived filtering and immutable sorting for leaderboards.
- Handle asynchronous errors and prevent stale responses from updating state.
- Follow `TASK_DECOMPOSITION.md`; verify each main task before marking it complete.
- Run tests, lint, typecheck and build before committing each milestone.
- Avoid unnecessary changes to Homework 1, Homework 2 and Lab 2 code.
- Do not create a screenshots folder or capture screenshots; screenshots will be provided manually.
