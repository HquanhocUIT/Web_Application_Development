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

Exercise 1 must implement these functions **from scratch**, in their respective authorized WBS tasks:

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
