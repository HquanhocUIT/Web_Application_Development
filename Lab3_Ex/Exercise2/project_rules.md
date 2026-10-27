# Project Rules — Lab 3, Exercise 2

**Exercise:** Interactive Scientist & Pioneer Directory
**Work scope:** `Lab3_Ex/Exercise2` only
**Task order and commit checkpoints:** `TASK_DECOMPOSITION.md`

## 1. Technology and implementation style

- Use React 19, JavaScript/JSX, semantic HTML, and CSS.
- Prefer HTML, CSS, JavaScript, and React concepts covered in class. Keep the code simple and readable; do not add an external UI library without need.
- Do not use `dangerouslySetInnerHTML` or complex techniques outside the course scope without a clear requirement.

## 2. One-subtask workflow

- Follow `TASK_DECOMPOSITION.md` in order. Complete only the explicitly requested subtask and stop; do not implement the whole exercise at once.
- Before coding, define the data schema, component props, state, and intended semantic structure.
- If the project has not yet been initialized, report that during tasks that do not authorize setup. Do not initialize or install dependencies outside the authorized subtask.

## 3. Data and state

- Define `SMART_PEOPLE` with stable `id`, `name`, `age`, and `iq` fields. Preserve the six required people and include `{ id: 'sp-7', name: 'Nguyen Phan Hoang Quan', age: 20, iq: 199 }` in the initial data and Reset result.
- Keep independent state in `useState` for `people`, `query`, `minIq`, and `sortBy`. Do not store `visiblePeople` as state.
- Derive `visiblePeople` directly from state using `filter()` and ES2023 `toSorted()`; never mutate the state array with `sort()`.
- Search names case-insensitively and trim surrounding whitespace.
- The IQ input must use `type="number"` and `event.target.valueAsNumber`; handle empty/invalid input so `minIq` remains a valid number.
- Do not use `useEffect` for search, filtering, or sorting.
- Delete by stable `id` with an immutable state update; do not use `splice()` or mutate the original data. Reset restores all seven original records.

## 4. Semantics and interaction

- Use `useId()` for input IDs and associate labels through `htmlFor`.
- Render people with `key={person.id}`; never use array indexes as keys.
- Announce the result count with `<output role="status" aria-live="polite">` or an equivalent semantic structure meeting the same requirement.
- Preserve logical keyboard focus after Delete when an appropriate remaining control can receive it. Claim focus behavior was tested only after testing it in a browser.
- Keep the interface usable and responsive, with readable text contrast.

## 5. Verification and reporting

- After each implementation subtask, run `npm.cmd run build`, `npm.cmd run lint`, and checks relevant to that subtask when scripts are available.
- Check React DevTools Profiler when the environment allows it. For typing one character in Search, report the measured render count; do not claim a result without measuring it.
- Report commands, actual outcomes, and environment limitations. Do not invent test results or evidence.
- If an AI-caused issue occurs, state the observed evidence, its correction, and the recheck result.

## 6. Git checkpoints and scope

- Create exactly these three commits and only at the corresponding checkpoints in `TASK_DECOMPOSITION.md`:
  1. `feat(ex2): normalize smartPeople schema with stable IDs`
  2. `feat(ex2): add search, IQ filter & toSorted`
  3. `feat(ex2): implement delete and reset`
- Do not commit after each subtask, create any additional commit, or push to GitHub unless separately authorized.
- Edit, stage, and commit files only inside `Lab3_Ex/Exercise2`. Preserve Exercise1, all Homework files, other Exercises, and existing Lab2_Ex changes.

## Current task boundary

- For the request to create this rules file, create only `project_rules.md` in Exercise2.
- Read but do not modify `TASK_DECOMPOSITION.md`.
- Do not initialize React, install dependencies, write application code, begin E2-01, or create a Git commit.
- After verifying the file, report the main rules and stop.
