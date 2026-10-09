# Project Rules — Lab 2, Exercise 1: Mini-React VNode & Mounting Engine

## 1. Anti-One-Shot / Anti-Monolithic AI Development

- NEVER implement the entire exercise in a single prompt.
- NEVER execute more than ONE WBS sub-task per AI request.
- NEVER automatically proceed to the next sub-task or implement future tasks early.
- Every task must be independently reviewable and verifiable.
- Stop immediately after completing the explicitly requested sub-task.
- Wait for explicit user approval before continuing.

## 2. WBS-Driven Development

- `TASK_DECOMPOSITION.md` is the source of truth for task planning, order, dependencies, and progress.
- Read the WBS before starting implementation.
- Execute only the explicitly requested task ID, respecting all preceding dependencies.
- Never skip verification checkpoints, including the dedicated WBS verification tasks.
- Update a task checkbox only after that task's acceptance criteria have been verified.
- Do not mark unrelated tasks as completed.
- Keep implementation, verification, and commit checkpoints separate when the WBS defines them separately.

## 3. Minimal Implementation Principle

- Follow KISS (Keep It Simple) and YAGNI (You Aren't Gonna Need It).
- Prefer the smallest correct implementation for the current task.
- Avoid speculative abstractions and unnecessary architectural patterns.
- Do not install dependencies unless explicitly required and authorized.
- Do not rewrite existing code unnecessarily or perform unrelated refactoring.
- Avoid monolithic functions and oversized modules.

## 4. Mini-React Architecture Constraints

Exercise 1 must implement these functions

# Project Development Rules

## Lab 2: Modern React Architecture, Virtual DOM & State Machines

**Exercise 1:** Building a Mini-React VNode & Mounting Engine

**Source of Truth:** `TASK_DECOMPOSITION.md`

## Rule 1: Anti-One-Shot / Anti-Monolithic Development

- ONE PROMPT = ONE WBS SUB-TASK.
- Never implement the entire exercise in one response.
- Never execute multiple WBS sub-tasks simultaneously.
- Complete only the explicitly requested sub-task.
- Stop after completing and verifying the current task.
- Wait for explicit user approval before proceeding.

## Rule 2: WBS-Driven Development

- Follow `TASK_DECOMPOSITION.md` strictly.
- Execute Tasks 1.1 through 1.6 in dependency order.
- Verify each task before marking its checkbox as completed.
- Keep incomplete tasks unchecked.
- Never skip, merge, or automatically start another task.
- Do not add unrelated implementation tasks.
- Treat `TASK_DECOMPOSITION.md` as the authoritative progress tracker.

## Rule 3: Technology Stack

- Use Vanilla JavaScript with ES Modules.
- Use HTML5 and CSS3.
- Use native browser DOM APIs.
- Do not use ReactJS, JSX, TypeScript, or external frameworks.
- Do not introduce unnecessary libraries or dependencies.
- Keep the project compatible with modern browsers.

## Rule 4: Mini-React Architecture

- Define VNode and Props contracts before implementation.
- Implement `createTextElement()` to represent primitive text children.
- Implement `createElement()` with nested children flattening and normalization.
- Implement recursive `renderToDOM()` with text and element type guards.
- Support standard props such as `id`, `role`, and `className`.
- Support event handlers such as `onClick`.
- Preserve VNode hierarchy and semantic HTML structure.
- Avoid unnecessary `<div>` wrappers.
- Keep the architecture minimal and limited to Exercise 1.

## Rule 5: Security

- Prevent XSS when rendering VNode text.
- Use `document.createTextNode()` or equivalent safe DOM text APIs.
- Never use `innerHTML` to render VNode text.
- Treat `<script>alert(1)</script>` as literal text.
- Never execute text content as JavaScript.
- Attach event handlers using `addEventListener()`.
- Do not evaluate event-handler strings as executable code.

## Rule 6: Testing and Verification

- Test semantic HTML elements:
  - `<main>`
  - `<section>`
  - `<header>`
  - `<h1>`
  - `<p>`
  - `<button>`
- Test nested VNode structures and children ordering.
- Test nested array flattening and primitive normalization.
- Test standard props and event handlers.
- Test XSS resistance using `<script>alert(1)</script>`.
- Inspect the rendered DOM using Chrome DevTools.
- Confirm that unnecessary wrapper elements are absent.
- Never claim tests passed unless they were actually executed.
- Clearly distinguish expected results from observed results.

## Rule 7: Clean Code

- Follow KISS (Keep It Simple, Stupid).
- Follow YAGNI (You Aren't Gonna Need It).
- Follow DRY (Don't Repeat Yourself).
- Avoid unnecessary abstractions and premature optimization.
- Keep functions small, readable, and focused.
- Use clear and consistent naming conventions.
- Do not refactor unrelated code.
- Make only the changes required by the current WBS sub-task.

## Rule 8: Code Delivery

- Always provide complete source code directly in chat.
- Use one code block per source file.
- Ensure code is ready to copy and paste.
- Never provide pseudocode or incomplete implementation snippets.
- Do not assume access to the user's local repository or computer.
- Do not generate unrelated files.
- Preserve the required project structure:

```text
lab02_exercise1/
├── index.html
├── mini-react.js
├── test-runner.js
├── project_rules.md
└── TASK_DECOMPOSITION.md
```

- File responsibilities:
  - `index.html`: Main HTML page and mounting container.
  - `mini-react.js`: Mini-React VNode and DOM engine.
  - `test-runner.js`: Browser tests and mounting verification.
  - `project_rules.md`: Development constraints.
  - `TASK_DECOMPOSITION.md`: WBS and progress tracking.

## Rule 9: Git Workflow

- Keep Git commits atomic and task-focused.
- Commit only files related to the completed task.
- Follow the required implementation checkpoints:
  - Commit 1: `feat(core): implement createElement factory`
  - Commit 2: `feat(core): implement renderToDOM`
- Provide appropriate Git commands after successful verification.
- Do not automatically execute Git commands.
- Never claim a commit or push succeeded without evidence.
- Do not include unrelated changes in commits.

## Rule 10: Task Completion

Every WBS sub-task response must include:

1. Complete implementation or requested document.
2. Brief explanation of the changes.
3. Verification instructions and actual results, if available.
4. Instructions for updating the corresponding WBS checkbox.
5. Appropriate Git commit and push commands when applicable.
6. An explicit stop before the next sub-task.

A task may be marked completed only after its acceptance criteria have been verified.

If verification cannot be performed, report the limitation and leave the corresponding WBS checkbox unchecked.

## Development Workflow

1. Read the current task in `TASK_DECOMPOSITION.md`.
2. Confirm that prerequisite tasks are completed.
3. Implement only the requested sub-task.
4. Provide complete, copy-paste-ready deliverables.
5. Provide verification steps.
6. Verify the task before marking it completed.
7. Update only the corresponding WBS checkbox after verification.
8. Provide appropriate Git commands.
9. Stop and wait for explicit user permission.

## Current Documentation Checkpoint

**Task 0.2: Create Project Rules**

Verification checklist:

- [ ] `project_rules.md` contains all 10 required rules.
- [ ] Project structure matches the required layout.
- [ ] Rules are consistent with `TASK_DECOMPOSITION.md`.
- [ ] No JavaScript or HTML implementation files were created or modified.
- [ ] Task 1.1 has not been started.

### Suggested Git Commands

```bash
git add project_rules.md
git commit -m "docs: add project development rules"
git push
```

These commands must be executed manually after reviewing and verifying the document.

## Final Constraint

**ONE PROMPT = ONE WBS SUB-TASK.**

Never proceed to another task without explicit user approval.
**from scratch**, in their respective authorized WBS tasks:

- `createElement`
- `createTextElement`
- `renderToDOM`

Constraints:

- Use the project's existing JavaScript/TypeScript language and module conventions.
- Maintain a predictable VNode structure with an explicit VNode and Props contract.
- Normalize child VNodes and flatten nested child arrays in their original order.
- Convert supported primitive children into text VNodes.
- Recursively mount VNodes as actual DOM nodes.
- Handle element props and event handlers.
- Do not introduce React or another virtual DOM library.
- **Do not implement any of these functions while creating this rules file.**

## 5. Semantic HTML Requirements

- Preserve semantic element types requested by VNodes.
- Use `<main>`, `<header>`, `<section>`, `<h1>`, `<p>`, and `<button>` when specified by VNodes.
- Do not replace semantic elements with generic `<div>` wrappers.
- Do not introduce unnecessary wrapper nodes.
- Ensure the resulting DOM hierarchy matches the VNode hierarchy, including child order.

## 6. Security and XSS Prevention

- Treat child strings as plain text, never as executable HTML.
- Use safe DOM APIs such as `document.createTextNode()` and `textContent` for text.
- Never use `innerHTML` to render child text.
- Never use `eval()` or `new Function()`.
- Do not execute arbitrary HTML strings.
- Attach event handlers using safe DOM APIs such as `addEventListener()`.

**Security checkpoint:** The string `<script>alert(1)</script>` must remain literal text and must never execute.

## 7. Verification and Testing

- Every implementation task must have relevant verification, performed at its appropriate WBS checkpoint.
- Verification may include checking VNode shape, nested-children flattening, and text-node normalization.
- Verify recursive DOM mounting, DOM attributes, and event handlers.
- Run the provided `test-runner.js` if available, at its designated WBS checkpoint.
- Confirm XSS resistance, semantic HTML structure, and absence of extra wrappers.
- Inspect the rendered DOM in browser DevTools at its designated WBS checkpoint.
- Never claim a test passed unless it was actually executed.
- If verification cannot be run, explain what was blocked and why; do not mark its checkbox complete.

## 8. Git and Atomic Commit Rules

- Use small, meaningful commits at the explicit WBS commit checkpoints only.
- Never combine unrelated modifications in one commit.
- Review the Git diff before committing.
- Never commit automatically unless the current task explicitly authorizes a commit.
- Never run destructive Git commands without explicit permission.
- Do not make empty commits when a verification checkpoint yields no file changes.

Suggested commit messages:

- `feat(core): define vnode contract`
- `feat(core): implement createElement factory`
- `feat(core): implement renderToDOM`
- `test(core): verify vnode mounting and xss safety`

## 9. Agent Communication Protocol

For each future implementation request, the AI must:

1. Identify the requested WBS Task ID.
2. Briefly state the allowed scope.
3. Modify only files needed for that task.
4. Perform only the smallest relevant verification permitted by the WBS task boundary.
5. Report exactly which files changed.
6. Report verification results honestly, including any tests not run and why.
7. Stop and wait for further instructions.

If a request contains multiple implementation sub-tasks, do not execute them together; ask the user to choose one.

## 10. Definition of Done

A sub-task is complete only when:

- Its explicitly requested change or checkpoint has been performed.
- Its acceptance criteria are satisfied.
- Relevant verification has been performed (at the appropriate checkpoint).
- No unrelated files were modified.
- Its WBS checkbox is updated only after verification, without changing unrelated checkboxes.
- The AI stops without starting another sub-task and waits for explicit authorization.

For commit-only or verification-only WBS tasks, the requested change means that checkpoint itself; do not implement unrelated functionality to satisfy it.

## Strict Execution Constraints — Rules-File Creation Request

For this request only:

- Create **only** `project_rules.md` in the project root.
- Read but do not modify `TASK_DECOMPOSITION.md`.
- Do not modify existing application code or create any application source or test files.
- Do not create `mini-react.js`.
- Do not install dependencies.
- Do not implement VNode or Props interfaces, `createElement`, `createTextElement`, or `renderToDOM`.
- Do not make Git commits or start Exercise 1 implementation.
- After verifying all 10 required sections, report the created path and stop.
