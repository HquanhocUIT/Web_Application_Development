# Project Rules — Exercise 2: Reactive State Machine & Delegation Hub

## 1. Technology Stack
- Use HTML, CSS, and vanilla JavaScript with ES Modules (`import` / `export`).
- Do not use React or any third-party state management library.

## 2. State Management
- Implement a custom `useState` mechanism from scratch.
- Keep application state in a clearly defined central store.
- Implement the reset cursor behavior specified in `TASK_DECOMPOSITION.md`.
- Follow unidirectional data flow: user action → state update → reactive render.
- Update the UI from state; do not treat the DOM as the source of truth.

## 3. Rendering
- Apply reactive rendering whenever relevant state changes.
- Keep rendering logic separate from state management and event handling.
- Ensure the Task Manager UI consistently reflects the latest state.

## 4. Event Handling
- Use event delegation at the root container for Task Manager actions.
- Do not use inline event handlers such as `onclick`.
- Do not register a separate event listener for each button.
- Identify actions through stable attributes such as `data-action` and dispatch them to the proper handler.

## 5. Code Organization
- Divide code into clearly named ES Modules with distinct responsibilities.
- Keep code readable, maintainable, and free of unnecessary duplication.
- Use consistent naming and formatting conventions.
- Prefer small, focused functions.

## 6. Workflow & WBS
- Follow `TASK_DECOMPOSITION.md` in order, from Project Setup through Git Commits.
- Complete and verify each milestone before proceeding to the next.
- Do not skip required tasks or subtasks.

## 7. Testing & Verification
- Verify state initialization, updates, reset cursor behavior, and reactive rendering.
- Verify root-level event delegation and Task Manager actions.
- Check browser console errors and unexpected UI behavior.

## 8. Git Commit Policy
- Create a separate Git commit for each completed milestone.
- Write all commit messages in English, using clear, descriptive wording.
- Do not combine unrelated milestones into one commit.
- Example: `feat: implement reactive useState dispatcher`.

## 9. Current Scope
- This file defines implementation rules only.
- Do not implement application code at this stage.
