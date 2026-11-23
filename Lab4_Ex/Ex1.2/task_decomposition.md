# Exercise 1.2 — Work Breakdown Structure (WBS)

This exercise uses JavaScript and JSX as explicitly requested for this project copy. Exercise 1.1 remains unchanged.

## Tasks

- [x] 1. Copy the Exercise 1.1 project to `ex1.2_lab4_web`.
  - Copied source and project assets into this folder.
  - Did not copy the original `node_modules` or `dist` directories.
- [x] 2. Convert the application from TypeScript to JavaScript.
  - Renamed `.tsx` files to `.jsx` and `.ts` Vite configuration to `.js`.
  - Removed TypeScript-only annotations, interface definitions, `types/Person`, `tsconfig` files, and direct TypeScript/React type dependencies. No `.ts` or `.tsx` source files remain. The lockfile retains Vite's optional `@types/node` peer entry.
  - Updated the HTML entry point to `/src/main.jsx`.
- [x] 3. Configure Vite and ESLint for JavaScript and JSX.
  - Kept the React Vite plugin and changed the build script to `vite build`.
  - Added an ESLint flat config for `.js`/`.jsx` with browser/Node globals and React Hooks rules.
  - Set `npm run lint` to `eslint .` and refreshed the package lockfile.
- [x] 4. Verify the converted project.
  - `npm install` completed with no reported vulnerabilities.
  - `npm run lint` passed.
  - `npm run build` passed and emitted separate lazy page chunks.
  - Removed the locally generated `node_modules` and `dist` after verification to keep the duplicate free of those directories.
- [x] 5. Preserve Exercise 1.1.
  - All conversion changes were made in `Ex1.2/ex1.2_lab4_web`; Exercise 1.1 files were not edited.
- [x] 6. Refactor routing with React Router v7.
  - Kept `Routes`, nested routes, `element={<Component />}`, shared `SiteLayout`, and `Outlet`.
  - Used `NavLink`'s `isActive` callback to apply the active navigation class; React Router also sets `aria-current="page"`.
  - Kept the lazy-loaded page components and detail Skeleton Suspense fallback.
  - Verified Home, People List, and Person Detail routes in the production preview; active navigation matched each route. ESLint and production build passed.
- [x] 7. Build a responsive People Master-Detail View.
  - Added a left people list and right detail pane using `grid-template-columns: minmax(280px, 1fr) 2fr`; switches to one column on mobile.
  - Used `useParams()` and `people.find()` for URL-selected details; invalid IDs render `NotFoundState` while retaining the list.
  - Kept semantic `dl`, `dt`, and `dd` fields and lazy-loaded Person Detail behind a Suspense skeleton.
  - Verified list, valid detail, invalid ID, active person selection, and mobile single-column layout in the production preview. ESLint and production build passed.
- [x] 8. Review Exercise 1.2 routes, accessibility, responsiveness, and production output.
  - Reviewed nested layout routes, lazy page imports, `NavLink` active state, `people/:personId`, the invalid-person state, and the wildcard 404 route.
  - Reviewed keyboard focus styling, skip link, landmarks, live loading status, semantic detail fields, reduced-motion handling, color use, and the mobile one-column breakpoint.
  - `npm run lint` passed and `npm run build` passed; production output keeps Home, People, Person Detail, and 404 in separate chunks.
  - Numeric Lighthouse optimization and results are tracked in task 9 below.
- [x] 9. Optimize and verify the production Lighthouse audit.
  - Added a valid `public/robots.txt` so the SEO crawlability audit passes.
  - Inlined the small app stylesheet and added route-specific module preloads in the production HTML while keeping page components in separate lazy chunks.
  - Reserved mobile vertical space for the People detail master-detail route to prevent the footer shifting while the route chunks load.
  - `npm run lint` and `npm run build` passed.
  - Lighthouse production preview (`http://localhost:5174/people/daniel-reyes`, mobile, provided/no throttling) scored Performance 100, Accessibility 100, Best Practices 100, and SEO 100; CLS 0, LCP 0.5 s, and TBT 0 ms in this run. Scores can vary across runs and machines.
