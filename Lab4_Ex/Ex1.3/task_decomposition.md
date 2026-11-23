# Exercise 1.3 — Work Breakdown Structure (WBS)

## 1. Independent Project Setup

- [x] Create a standalone Vite project in `ex1.3_lab4_web` with React and JavaScript.
- [x] Configure ESLint for JavaScript/JSX and add lint/build scripts.
- [x] Keep the project independent; do not copy Exercise 1.2 or modify earlier exercises.

## 2. Form Components

- [x] Create `InputField.jsx` with associated labels, input types, accessible error messaging, and keyboard focus support.
- [x] Create `SimpleForm.jsx` with Name, Email, Password, and Submit.
- [x] Add per-field validation and visible inline errors.

## 3. Legacy Validation Anti-Pattern

- [x] Effect 1: synchronize input state from the form up to its parent.
- [x] Effect 2: validate fields whenever input values change.
- [x] Effect 3: derive form validity from the validation errors state.
- [x] Effect 4: synchronize validation error props into local state in `InputField`.
- [x] Effect 5: scroll to and focus the first invalid field after submit.
- [x] Add a render counter and console logs to expose the cascading render/effect sequence.
- [x] Keep unsafe async races and infinite loops out of the running form; remove the extra risk-explainer panel at the user's request so the five-effect demonstration stays central.
- [x] Keep the legacy effect-based architecture for analysis; do not refactor it.

## 4. Responsive and Accessible UI

- [x] Use semantic headings, form, labels, status messaging, and accessible field errors.
- [x] Provide keyboard-visible focus indicators and a responsive single-column mobile layout.
- [x] Use high-contrast text and controls with no external UI/form dependencies.

## 5. Testing and Final Review

- [x] Run `npm run lint` — passed.
- [x] Run `npm run build` — passed; Vite produced the production bundle.
- [x] Run Lighthouse against the production preview on mobile — Performance 100, Accessibility 100, Best Practices 100, SEO 100; CLS 0 in this run.
- [x] Add `robots.txt` and an SVG favicon after the audit found the missing crawler file and favicon 404.
- [x] Review the five effect responsibilities, field validation, render counter/logs, accessible markup, and responsive CSS in source.
- [x] Keep Exercises 1.1 and 1.2 unchanged; added the requested `AI_failure_audit.md` files separately in each exercise folder.
- [ ] Verify typing, submission focus/scroll, and narrow-screen interaction in a live browser; browser tools are unavailable in this environment.
