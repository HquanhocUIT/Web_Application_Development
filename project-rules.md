# Project Architectural Constraints

- Use Vanilla HTML5, modern CSS, and ES6+ JavaScript exclusively.
- Do not use jQuery, Bootstrap, Tailwind, or external script CDNs.
- Prefer native semantic HTML over generic container elements.
- Declare variables with `const` by default; use `let` only when reassignment is required.
- Never render user input with `innerHTML` because of XSS risk.
- Use a mobile-first approach and verify the 375px viewport before desktop layouts.
- Always read this file and `TASK_DECOMPOSITION.md` before proposing or applying code changes.
- Work on one WBS task at a time. Do not combine HTML, CSS, and JavaScript milestones in one change.
