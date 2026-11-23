# Exercise 1.1 — Work Breakdown Structure (WBS)

Checkboxes track completion. Complete tasks only when their work and relevant acceptance checks have been performed.

## Tasks

- [x] 1. Initialize a React and TypeScript project with Vite.
  - Keep Exercise 1.1 in its own folder.
  - Scaffolded under `ex1_lab4_web` with the Vite React TypeScript template.
  - Installed dependencies, including React Router (`react-router`).
  - Added `src/components`, `src/pages`, and `src/types`.
  - Confirmed `npm run dev` starts Vite and `http://127.0.0.1:4173/` returns HTTP 200.
- [x] 2. Build routing.
  - Implemented `/`, `/people`, and `/people/:personId` with React Router.
  - Added navigation links, mock people data, and a not-found response for unknown person IDs and routes.
  - Verified the home page, people list, six real detail routes, unknown person IDs, unknown routes, and client-side navigation in a browser.
- [x] 3. Implement `React.lazy` and dynamic imports.
  - Added dynamic imports for Home, People List, Person Detail, and Not Found page components through `React.lazy()`.
  - Production build emits separate page chunks, including `PersonDetailPage-*.js`.
  - Confirmed the Person Detail chunk is requested when its route loads and that pausing the chunk request displays the Suspense skeleton until the request resumes.
- [x] 4. Implement a `Suspense` boundary.
  - Place the boundary around the lazy-loaded content.
  - Added an accessible `Loading page...` fallback in the shared layout and a dedicated Person Detail skeleton fallback.
- [x] 5. Build Skeleton Loading.
  - Added a Person Detail skeleton with avatar, title, role, bio, personal information, and back-link placeholders.
  - Added `role="status"`, `aria-live="polite"`, and `aria-busy="true"`; decorative placeholder shapes are hidden from assistive technology.
  - Added a CSS pulse animation with reduced-motion support; no third-party skeleton package is used.
  - `npm run build` passed, including the TypeScript build step.
- [x] 6. Prevent layout shift.
  - Reserved matching geometry and responsive bio space for the skeleton and loaded detail content.
  - Browser measurement found a 12 px height difference at desktop width; added responsive minimum heights to the detail panel.
  - Rechecked with the Person Detail chunk paused until the skeleton appeared: skeleton and loaded panel heights matched at 1280 px (469 px) and 320 px (597 px), with no observed layout-shift entries during loading.
- [x] 7. Add accessibility.
  - Reviewed landmarks, page headings, lists, links, and the Person Detail definition list.
  - Added a skip-to-main link; navigation uses native links and the main region is its target.
  - Added a visible 3px keyboard focus outline and checked its contrast along with text colors.
  - Verified the skip link receives keyboard focus and the skeleton exposes `role="status"`, `aria-live="polite"`, and `aria-busy="true"`; reduced-motion handling is present in CSS.
  - `npm run lint` runs Oxlint in this project; its check passed.
- [x] 8. Optimize and measure production Performance and SEO.
  - Added a valid `public/robots.txt`; Lighthouse previously parsed the SPA fallback HTML as robots directives and reported 19 errors.
  - Inlined the small built stylesheet to remove a render-blocking CSS request. Added route-specific module preloads so only the requested lazy page chunk starts early; page chunks remain split and are still requested by route.
  - `npm run lint` (Oxlint) and `npm run build` passed; the build includes the TypeScript check.
  - Lighthouse 12.8.2 on production preview `/people/maya-chen`: mobile form factor with no throttling scored Performance 100 and SEO 100 (FCP 0.2 s, LCP 0.5 s, TBT 0 ms, CLS 0). Desktop preset scored Performance 100 and SEO 100.
  - Mobile form factor with Lighthouse simulated 4x CPU and network throttling scored Performance 99 and SEO 100 (FCP 1.4 s, LCP 1.6 s, TBT 10 ms, CLS 0). Scores depend on throttling and machine conditions.
  - ESLint remains unverified: this project runs Oxlint, and the ESLint/TypeScript parser dependency conflict described above remains unresolved.