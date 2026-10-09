
/**
 * Lab 2: Modern React Architecture, Virtual DOM & State Machines
 * Exercise 1: Mini-React VNode & Mounting Engine
 *
 * Task 1.5: HTML Test Environment & Browser Test Runner
 *
 * Tests the existing Mini-React implementation in a browser.
 */

import {
  createElement,
  createTextElement,
  renderToDOM,
} from "./mini-react.js";

// --------------------------------------------------
// 1. Test environment
// --------------------------------------------------

const app = document.getElementById("app");
const testResults = document.getElementById("test-results");
const testSummary = document.getElementById("test-summary");

let passed = 0;
let failed = 0;
let clickCount = 0;

/**
 * Checks a condition and throws if it is false.
 *
 * @param {boolean} condition
 * @param {string} message
 * @returns {void}
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Runs one test and displays its actual result.
 *
 * @param {string} name
 * @param {function(): void} callback
 * @returns {void}
 */
function test(name, callback) {
  const item = document.createElement("li");

  try {
    callback();

    passed++;
    item.className = "pass";
    item.textContent = `PASS: ${name}`;
  } catch (error) {
    failed++;
    item.className = "fail";
    item.textContent = `FAIL: ${name} - ${error.message}`;

    console.error(`Test failed: ${name}`, error);
  }

  testResults.appendChild(item);
}

/**
 * Displays the total number of passed and failed tests.
 *
 * @returns {void}
 */
function updateSummary() {
  testSummary.textContent =
    `Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`;
}

// --------------------------------------------------
// 2. Create sample VNode tree
// --------------------------------------------------

const unsafeText = "<script>alert(1)</script>";

const vnode = createElement(
  "main",
  {
    id: "mini-react-root",
    role: "main",
    className: "mini-app",
  },
  createElement(
    "header",
    null,
    createElement("h1", null, "Hello Mini-React")
  ),
  createElement(
    "section",
    { id: "content-section" },
    [
      createElement("p", null, "This is a Mini-React demo."),
      [
        createElement("p", null, "Count: ", 123),
        createElement("p", { id: "safe-text" }, unsafeText),
      ],
    ]
  ),
  createElement(
    "button",
    {
      id: "test-button",
      onClick: () => {
        clickCount++;
      },
    },
    "Click me"
  )
);

// --------------------------------------------------
// 3. Render and mount
// --------------------------------------------------

let root = null;
let mountError = null;

try {
  assert(app !== null, "Mounting container #app is missing.");

  root = renderToDOM(vnode);
  app.appendChild(root);
} catch (error) {
  mountError = error;
  console.error("Mini-React mounting failed:", error);
}

// --------------------------------------------------
// 4. Browser test cases
// --------------------------------------------------

// Test 1: Valid element VNode
test("createElement() returns a valid VNode", () => {
  const node = createElement("h1", { id: "title" }, "Hello");

  assert(node.type === "h1", "Incorrect VNode type.");
  assert(node.props.id === "title", "Props were not preserved.");
  assert(Array.isArray(node.children), "Children must be an array.");
  assert(node.children.length === 1, "Incorrect child count.");
});

// Test 2: Valid text VNode
test("createTextElement() returns a valid text VNode", () => {
  const node = createTextElement(123);

  assert(node.type === "TEXT_ELEMENT", "Incorrect text type.");
  assert(node.props.nodeValue === "123", "Text conversion failed.");
  assert(Array.isArray(node.children), "Children must be an array.");
  assert(node.children.length === 0, "Text VNode must have no children.");
});

// Test 3: Recursive DOM rendering
test("Nested VNodes render recursively", () => {
  assert(root !== null, mountError?.message ?? "Root is missing.");

  const heading = root.querySelector("header h1");
  const section = root.querySelector("section");

  assert(heading !== null, "Nested heading is missing.");
  assert(section !== null, "Nested section is missing.");
  assert(
    heading.textContent === "Hello Mini-React",
    "Heading text is incorrect."
  );
});

// Test 4: Semantic HTML
test("Semantic HTML elements are preserved", () => {
  assert(root !== null, "Root is missing.");

  assert(root.tagName === "MAIN", "Expected main element.");
  assert(root.querySelector("header") !== null, "Header missing.");
  assert(root.querySelector("h1") !== null, "H1 missing.");
  assert(root.querySelector("p") !== null, "Paragraph missing.");
  assert(root.querySelector("button") !== null, "Button missing.");
});

// Test 5: HTML attributes
test("id, role, and className are applied correctly", () => {
  assert(root !== null, "Root is missing.");

  assert(root.id === "mini-react-root", "Incorrect id.");
  assert(root.getAttribute("role") === "main", "Incorrect role.");
  assert(
    root.className === "mini-app",
    "className was not mapped to class."
  );
});

// Test 6: Flattening and normalization
test("Nested children are flattened and normalized", () => {
  const node = createElement(
    "section",
    null,
    ["First", ["Second", 123], null, false, undefined]
  );

  assert(node.children.length === 3, "Incorrect child count.");

  const values = node.children.map(
    (child) => child.props.nodeValue
  );

  assert(
    JSON.stringify(values) ===
    JSON.stringify(["First", "Second", "123"]),
    "Child order or normalization is incorrect."
  );

  assert(
    node.children.every((child) => child.type === "TEXT_ELEMENT"),
    "Primitive children were not converted to text VNodes."
  );
});

// Test 7: Button exists
test("root.querySelector('button') is not null", () => {
  assert(root !== null, "Root is missing.");

  assert(
    root.querySelector("button") !== null,
    "Button was not rendered."
  );
});

// Test 8: Click event
test("onClick executes exactly once per click", () => {
  assert(root !== null, "Root is missing.");

  const button = root.querySelector("button");

  assert(button !== null, "Button is missing.");

  const before = clickCount;

  button.click();

  assert(
    clickCount === before + 1,
    "Click handler did not execute exactly once."
  );
});

// Test 9: XSS-safe literal text
test("Script-like text is rendered literally", () => {
  assert(root !== null, "Root is missing.");

  const paragraph = root.querySelector("#safe-text");

  assert(paragraph !== null, "Safe-text paragraph is missing.");

  assert(
    paragraph.textContent === unsafeText,
    "Original text was modified."
  );

  assert(
    paragraph.firstChild?.nodeType === Node.TEXT_NODE,
    "Content must be a DOM Text node."
  );

  assert(
    paragraph.querySelector("script") === null,
    "Script-like text was parsed as HTML."
  );
});

// Test 10: No unexpected wrappers
test("No unexpected wrapper elements are introduced", () => {
  assert(root !== null, "Root is missing.");

  assert(root.tagName === "MAIN", "Root must be main.");
  assert(root.children.length === 3, "Unexpected root children.");

  assert(root.children[0].tagName === "HEADER", "Expected header.");
  assert(root.children[1].tagName === "SECTION", "Expected section.");
  assert(root.children[2].tagName === "BUTTON", "Expected button.");

  assert(
    root.querySelector("div") === null,
    "Unexpected div wrapper detected."
  );
});

// Test 11: VNode hierarchy matches the DOM
test("Mounted DOM matches the VNode hierarchy", () => {
  assert(root !== null, "Root is missing.");
  assert(app.firstChild === root, "Root is not mounted in #app.");
  assert(app.childNodes.length === 1, "Unexpected mount nodes.");

  /**
   * Compares VNode types and child order against DOM nodes.
   *
   * @param {Object} virtualNode
   * @param {Node} domNode
   * @returns {void}
   */
  function compareTree(virtualNode, domNode) {
    assert(domNode !== null, "DOM node is missing.");

    if (virtualNode.type === "TEXT_ELEMENT") {
      assert(
        domNode.nodeType === Node.TEXT_NODE,
        "Expected DOM Text node."
      );

      assert(
        domNode.nodeValue === virtualNode.props.nodeValue,
        "Text node value does not match."
      );

      return;
    }

    assert(
      domNode.nodeType === Node.ELEMENT_NODE,
      "Expected DOM Element node."
    );

    assert(
      domNode.tagName.toLowerCase() === virtualNode.type,
      "Element type does not match."
    );

    assert(
      domNode.childNodes.length === virtualNode.children.length,
      "Child count does not match."
    );

    virtualNode.children.forEach((child, index) => {
      compareTree(child, domNode.childNodes[index]);
    });
  }

  compareTree(vnode, root);
});

// --------------------------------------------------
// 5. Show test summary
// --------------------------------------------------

updateSummary();

console.log(
  `Mini-React tests completed: ${passed} passed, ${failed} failed.`
);
