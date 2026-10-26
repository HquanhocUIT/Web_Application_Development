# Project Rules — Lab 3, Exercise 1

**Exercise:** Semantic Engineer & Pro-Gamer Profile Card
**Work scope:** `Lab3_Ex/Exercise1` only
**Source of truth for task order and checkpoints:** `TASK_DECOMPOSITION.md`

## 1. Technology and implementation style

- Use React 19, JavaScript/JSX, semantic HTML, and CSS Modules.
- Prefer the HTML, CSS, JavaScript, and React concepts covered in the course.
- Keep the implementation small and focused on Exercise 1. Do not add libraries or abstractions without a requirement.
- Do not use `dangerouslySetInnerHTML` or unsafe HTTP image URLs.

## 2. WBS-driven, one-subtask workflow

- Read `TASK_DECOMPOSITION.md` and follow its task order and acceptance criteria.
- Complete only one explicitly requested WBS subtask at a time. Do not start the next subtask automatically.
- Before writing component code, define the props, data, and intended semantic HTML structure.
- Stop after the authorized subtask and report its changed files and actual verification results.
- Do not mark a WBS task complete unless its stated completion conditions have been met.

## 3. `DeveloperCard` requirements

- Implement `DeveloperCard` as a functional component using ES6 default parameters.
- Do not use any `<div>` element inside `DeveloperCard.jsx`.
- Use the required semantic elements where appropriate: `<article>`, `<header>`, `<hgroup>`, `<h2>`, `<dl>`, `<dt>`, `<dd>`, `<ul>`, and `<li>`.
- Use `aria-labelledby` on the card to reference the `id` of its title.
- Render metadata entries with React Fragments that have stable, unique keys.
- Render skill data through the separate `SkillBadge` component.

## 4. `SkillBadge` requirements

- Keep `SkillBadge` as a separate component.
- Pass skill data into it through props; do not hard-code the card's skills into the badge component.
- Use suitable semantic markup without adding unnecessary wrapper elements.

## 5. Styling and responsive behavior

- Style `DeveloperCard` and its skill badges with CSS Modules.
- Do not use inline styles. Avoid global CSS unless a specific project-level need requires it.
- Support a 375px viewport without horizontal overflow; keep the card content readable and usable.
- Verify responsive behavior with an actual viewport or browser measurement before claiming it passed.

## 6. Avatar and image handling

- Use an HTTPS avatar URL only.
- Set explicit `width` and `height` attributes so the image reserves its layout space.
- Provide an initials fallback when the avatar fails to load.
- Verify the fallback by exercising an image-load failure before claiming it works.

## 7. Setup and verification

- Do not initialize the React project, install dependencies, write application code, or commit while creating this rules file.
- Once project setup is authorized and dependencies are installed, run `npm run build`, `npm run lint`, and relevant checks after each implementation subtask when those scripts are available.
- Use checks suited to the current subtask. Record commands and observed results; state clearly when a check could not be run and why.
- Do not claim that semantic/accessibility checks, the Accessibility Tree, a browser, or responsive behavior were inspected unless that inspection actually occurred.
- Keep verification honest: do not invent test results or mark unperformed checks as passed.

## 8. AI issue notes

- If an AI-caused issue is encountered, record the observed evidence, its impact, the correction, and the result of rechecking it.
- Do not invent an issue, evidence, or a test result. If no issue has been observed, do not create a fabricated incident report.

## 9. Git checkpoints

- Create exactly these two commits, at the checkpoints specified in `TASK_DECOMPOSITION.md`:
  1. `feat(ex1): implement semantic DeveloperCard and SkillBadge`
  2. `style(ex1): add responsive 375px CSS module`
- Do not commit after every subtask. Do not make any other commits, including documentation-only commits.
- Before either checkpoint commit, review the diff and include only the changes allowed by that checkpoint.
- Do not create a checkpoint commit until its WBS conditions are satisfied. Do not commit automatically outside the explicitly authorized checkpoint task.

## 10. Repository boundaries

- Read and write Exercise 1 files only under `Lab3_Ex/Exercise1`.
- Do not modify HW1, HW2, HW3, other Exercises, or existing changes in `Lab2_Ex`.
- Do not include unrelated files in verification changes or Git commits.

## Current documentation-only task boundary

For the request to create this file:

- Create only `project_rules.md` in `Lab3_Ex/Exercise1`.
- Read `TASK_DECOMPOSITION.md` but do not modify it.
- Do not initialize React, install dependencies, write application code, start E1-01, or create a Git commit.
- After checking that these rules match the WBS and the user's requirements, report the created file and stop.
