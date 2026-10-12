# Exercise 3 — Resilient State Machine & Skeleton Loader

Responsive React + TypeScript Data Feed built with Vite.

## Run

```bash
npm install
npm run dev
```

Open the local address shown by Vite (typically `http://localhost:5173`).

## Verify

```bash
npm run typecheck
npm test
npm run build
```

## Try all four states

- **IDLE** — first load, before pressing a button.
- **LOADING** — press **Load Feed**, **Explore the feed** or **Retry Connection** to see pulse skeletons.
- **SUCCESS** — choose **Successful request** and load.
- **ERROR** — choose **Failed request** and load; switch to **Successful request** and click **Retry Connection** to recover.
- **Random outcome** — reproduces intermittent failures (~40% chance).

The simulator uses a 1.3-second asynchronous delay; it makes **no external API calls**. Google Fonts is an optional network resource; system fonts are the fallback.

## Architecture

- `src/types/state.ts` defines the four-state `ViewState<T>` union and a pure transition function.
- `src/hooks/useDataLoader.ts` owns state via React `useState`, request IDs, and abort cleanup.
- `src/services/api.ts` implements the abortable mock API.
- `src/components/` contains independent visual representations.
- `src/styles/index.css` contains responsive styling, reduced-motion rules and skeleton pulse animation.

**Implementation note:** WBS 2.3 proposes `useReducer`, while `project_rules.md` explicitly requires `useState`. The project follows `project_rules.md`: `useState` stores the view, while the pure `transition()` function enforces the same centralized transition rules. No reducer hook is used.
