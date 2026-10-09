# Work Breakdown Structure (WBS)

## Exercise 1: Mini-React VNode & Mounting Engine

- [ ] **Task 1.1: Inspect the existing project configuration and locate the intended Mini-React module and test entry points**
  - Verify the language/tooling already configured (JavaScript or TypeScript) without changing configuration or installing dependencies.
  - Identify whether `test-runner.js` exists and how it is expected to be executed.

- [ ] **Task 1.2: Define the `Props` contract**
  - Specify the shape for DOM attributes, event-handler props, and normalized `children`.
  - Keep the contract compatible with the project's existing JavaScript/TypeScript setup.

- [ ] **Task 1.3: Define the `VNode` contract**
  - Specify the element `type` and `props` fields required by the Mini-React engine.
  - Ensure the contract can represent both normal elements and text VNodes.

- [ ] **Task 1.4: Verify the VNode and Props contracts**
  - Confirm the contracts can represent semantic tags such as `main`, `header`, `section`, and `button` without wrapper-specific assumptions.
  - Confirm text VNodes fit the same recursive rendering model.

- [ ] **Task 1.5: Create an atomic Git commit for the VNode/Props contract change**
  - Commit only the contract-related change.

- [ ] **Task 1.6: Implement `createTextElement`**
  - Return the agreed text VNode shape.
  - Store text as data that will later be mounted through a DOM text node rather than parsed as HTML.

- [ ] **Task 1.7: Verify `createTextElement` behavior**
  - Check representative string and primitive-derived text values produce the expected text VNode structure.
  - Confirm HTML-looking text such as `<script>alert(1)</script>` remains plain text data at this stage.

- [ ] **Task 1.8: Create an atomic Git commit for `createTextElement`**
  - Commit only the text VNode factory change.

- [ ] **Task 1.9: Implement recursive/nested child flattening for `createElement`**
  - Flatten nested child arrays into one ordered child sequence.
  - Preserve the original left-to-right child order.

- [ ] **Task 1.10: Implement child normalization for `createElement`**
  - Convert supported primitive children into text VNodes through `createTextElement`.
  - Preserve already-created VNodes without wrapping them in extra DOM elements.

- [ ] **Task 1.11: Verify `createElement` flattening and normalization**
  - Check nested arrays flatten correctly.
  - Check primitive children become text VNodes.
  - Check existing VNodes remain structurally unchanged and ordered.

- [ ] **Task 1.12: Create an atomic Git commit for `createElement` child processing**
  - Commit only the flattening/normalization change.

- [ ] **Task 1.13: Implement the text-VNode branch of `renderToDOM`**
  - Add the type guard/branch needed to recognize text VNodes.
  - Create a real DOM `Text` node for text content.

- [ ] **Task 1.14: Verify text mounting and XSS resistance**
  - Mount a text VNode containing `<script>alert(1)</script>`.
  - Verify the string is visible as text and no script executes.

- [ ] **Task 1.15: Create an atomic Git commit for text-node mounting**
  - Commit only the text rendering branch.

- [ ] **Task 1.16: Implement DOM element creation for non-text VNodes**
  - Create the real DOM element directly from the VNode `type`.
  - Do not introduce unnecessary wrapper elements.

- [ ] **Task 1.17: Implement DOM attribute/property handling**
  - Apply non-event props to the created DOM element using behavior appropriate to the existing project requirements.
  - Exclude `children` from DOM attributes.

- [ ] **Task 1.18: Implement DOM event-handler binding**
  - Recognize event-handler props and attach the corresponding DOM listeners.
  - Keep event handling separate from normal attribute assignment.

- [ ] **Task 1.19: Implement recursive child mounting in `renderToDOM`**
  - Recursively render each normalized child VNode.
  - Append mounted children in VNode order to the correct parent element.

- [ ] **Task 1.20: Verify recursive mounting and prop handling**
  - Confirm nested VNodes become the expected nested DOM tree.
  - Confirm a representative normal attribute is applied.
  - Confirm a representative event handler fires from the mounted element.

- [ ] **Task 1.21: Create an atomic Git commit for DOM element creation, props, events, and recursive mounting**
  - Commit only the completed `renderToDOM` element-mounting behavior.

- [ ] **Task 1.22: Run the provided `test-runner.js` if available**
  - Execute the repository-provided test command or runner without altering dependencies.
  - Record any failing cases for follow-up rather than combining fixes into this verification task.

- [ ] **Task 1.23: Verify semantic HTML structure against the VNode tree**
  - Render a representative tree containing `main`, `header`, `section`, and `button`.
  - Confirm each semantic DOM element appears at the same structural position as its corresponding VNode.
  - Confirm no extra wrapper elements were introduced.

- [ ] **Task 1.24: Verify XSS behavior in the fully mounted tree**
  - Render `<script>alert(1)</script>` as a primitive child through the complete `createElement` → `renderToDOM` path.
  - Confirm it becomes a text node and does not execute.

- [ ] **Task 1.25: Inspect the mounted DOM in browser DevTools**
  - Compare the live DOM hierarchy with the expected VNode hierarchy.
  - Check semantic tags, text nodes, attributes, event-bound elements, child order, and absence of unnecessary wrappers.

- [ ] **Task 1.26: Create a final atomic Git commit for any verification-only fixtures or narrowly scoped corrections, if needed**
  - Keep each correction isolated; do not bundle unrelated fixes.
  - If no repository changes are required after verification, do not create an empty commit.
