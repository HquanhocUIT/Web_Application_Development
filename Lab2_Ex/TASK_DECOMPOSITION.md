# Work Breakdown Structure (WBS)

## Exercise 1: Mini-React VNode & Mounting Engine

- [ ] **Task 1.1: Define VNode & Props contracts.**
  - Define the expected VNode structure for element nodes and text nodes.
  - Define the shape and purpose of `props`.
  - Specify how `children` are stored in the VNode hierarchy.
  - Establish handling expectations for standard props such as `id`, `role`, and `className`.
  - Establish the naming convention for event handlers such as `onClick`.
  - Keep the contracts minimal and limited to Exercise 1 requirements.

- [ ] **Task 1.2: Implement `createTextElement()` factory.**
  - Convert primitive child values into text VNodes.
  - Ensure text values are represented as data rather than executable HTML.
  - Keep the text VNode structure consistent with the contract defined in Task 1.1.
  - Verify that text such as `<script>alert(1)</script>` remains literal text data.

- [ ] **Task 1.3: Implement `createElement()` with children flattening and normalization.**
  - Accept an element type, props, and child values.
  - Preserve the requested semantic element hierarchy without unnecessary wrapper elements.
  - Flatten nested child arrays.
  - Normalize primitive children into text VNodes using `createTextElement()`.
  - Preserve existing VNode children.
  - Store normalized children consistently in the resulting VNode.
  - Support props needed by Exercise 1, including `id`, `role`, `className`, and event-handler props.

- [ ] **Task 1.4: Implement recursive `renderToDOM()` with text/element type guards.**
  - Distinguish text VNodes from element VNodes.
  - Render text VNodes using safe DOM text APIs only.
  - Never use `innerHTML` to render VNode text content.
  - Create DOM elements matching the VNode element type.
  - Apply standard props such as `id`, `role`, and `className`.
  - Register event handlers such as `onClick`.
  - Recursively render and append child VNodes in the correct hierarchy.
  - Verify that `<script>alert(1)</script>` renders as literal text and does not execute.

- [ ] **Task 1.5: Create `index.html` and `test-runner.js` for browser testing.**
  - Create the main browser page and mounting container.
  - Load the Mini-React engine using ES Modules.
  - Create browser-based verification cases for VNode creation and DOM mounting.
  - Exercise semantic elements including `<main>`, `<section>`, `<header>`, `<h1>`, `<p>`, and `<button>`.
  - Verify props, nested children, normalized text children, and click-handler behavior.
  - Include a browser test for literal `<script>alert(1)</script>` text.

- [ ] **Task 1.6: Verify semantic HTML, XSS resistance, and DOM structure using Chrome DevTools.**
  - Inspect the rendered DOM hierarchy in Chrome DevTools.
  - Confirm that no unnecessary `<div>` wrappers were introduced.
  - Confirm that semantic elements match the intended VNode hierarchy.
  - Confirm `id`, `role`, and `className` are represented correctly in the DOM.
  - Confirm `onClick` behavior works as expected.
  - Confirm nested children arrays render in the expected order.
  - Confirm primitive children render as text nodes.
  - Confirm `<script>alert(1)</script>` appears as literal text and does not execute JavaScript.
  - Mark Exercise 1 complete only after all verification checks pass.

## Exercise 1 Requirements

- Use Vanilla JavaScript with ES Modules.
- Implement only:
  - `createElement`
  - `createTextElement`
  - `renderToDOM`
- Use semantic HTML including:
  - `<main>`
  - `<section>`
  - `<header>`
  - `<h1>`
  - `<p>`
  - `<button>`
- Preserve the VNode hierarchy without unnecessary `<div>` wrappers.
- Flatten nested children arrays.
- Normalize primitive children into text VNodes.
- Handle standard props such as `id`, `role`, and `className`.
- Support event handlers such as `onClick`.
- Render text safely using DOM text APIs and never `innerHTML`.
- Treat `<script>alert(1)</script>` as literal text without executing JavaScript.
- Inspect and verify the resulting DOM using browser DevTools.

## Development Rules

- ONE PROMPT = ONE WBS SUB-TASK.
- Never implement multiple WBS sub-tasks simultaneously.
- Never generate the entire Mini-React engine in one response.
- Finish and verify the current task before proceeding.
- Do not start the next task without explicit user permission.
- Follow KISS, YAGNI, and minimal-change principles.
- Keep Git commits atomic and aligned with the required checkpoints.

## Target Project Structure

```text
lab02_exercise1/
├── index.html
├── mini-react.js
├── test-runner.js
├── project_rules.md
└── TASK_DECOMPOSITION.md
```
