# Task Decomposition

## Project: Semantic DOM Architecture & A11y Contract

### T-01: Semantic DOM landmarks

- **Goal:** Build the initial semantic HTML landmark tree for the portfolio page.
- **Scope:** HTML only; do not add CSS or JavaScript in this milestone.
- **Requirements:**
  - Use native semantic elements: `header`, `nav`, `main`, `section`, and `footer`.
  - Use exactly one `h1`.
  - Use zero `<div>` elements.
  - Add an accessible skip link that points to `#main-content`.
  - Give the navigation an accessible label.
  - Give each content section a unique `id` for navigation.
- **Acceptance check:** The page has a clear landmark hierarchy and the skip link moves keyboard focus to the main content.
- **Verification:** Open Chrome DevTools → Elements → Accessibility and verify the landmark tree.
- **Commit:** `git commit -m "feat(html): semantic landmark tree"`

### Tasks intentionally postponed

- T-02: Design tokens and CSS custom properties in `:root`.
- T-03: Responsive grid layout.
- T-04: Isolated audio engine.
- T-05: Keyboard event listeners with repeat-rate throttling.
