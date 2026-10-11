/**
 * Checkpoint 2 verification — run with: node checkpoint2-verify.js
 * Minimal DOM test doubles, no third-party packages needed.
 */
const assert = require('node:assert/strict');

class Element {
  static listenerCount = 0;
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.dataset = {};
    this.children = [];
    this.attributes = {};
    this.hidden = false;
    this.textContent = '';
    this.value = '';
    this.id = '';
    this.parentElement = null;
    this.handlers = new Map();
    this.classes = new Set();
    this.classList = {
      toggle: (name, force) => {
        if (force === undefined ? !this.classes.has(name) : force) this.classes.add(name);
        else this.classes.delete(name);
      },
    };
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  append(...children) {
    for (const child of children) { child.parentElement = this; this.children.push(child); }
  }
  replaceChildren(...children) {
    this.children = [];
    this.append(...children);
  }
  addEventListener(type, callback) {
    assert.ok(!this.handlers.has(type), `Duplicate ${type} listener`);
    Element.listenerCount++;
    this.handlers.set(type, callback);
  }
  closest(selector) {
    for (let current = this; current; current = current.parentElement) {
      if (selector === '[data-action]' && current.dataset.action) return current;
    }
    return null;
  }
  contains(node) {
    for (let current = node; current; current = current.parentElement) {
      if (current === this) return true;
    }
    return false;
  }
  querySelectorAll(selector) {
    assert.equal(selector, '[data-action="filter"]');
    return filters;
  }
}

const root = new Element('section');
const input = new Element('input');
const filters = ['all', 'active', 'completed'].map(value => {
  const button = new Element('button');
  button.dataset = { action: 'filter', filter: value };
  button.parentElement = root;
  return button;
});
const elements = new Map([
  ['#task-app', root],
  ['#new-task-input', input],
  ['#task-list', new Element('ul')],
  ['#task-count', new Element('strong')],
  ['#empty-state', new Element('p')],
]);
for (const node of elements.values()) {
  if (node !== root) node.parentElement = root;
}
globalThis.document = {
  querySelector: selector => elements.get(selector),
  createElement: tag => new Element(tag),
};

function click(button, nested = false) {
  const target = nested ? new Element('span') : button;
  if (nested) target.parentElement = button;
  root.handlers.get('click')({ target });
}
function submit() {
  let prevented = false;
  root.handlers.get('submit')({
    target: { id: 'add-task-form' },
    preventDefault() { prevented = true; },
  });
  assert.ok(prevented, 'Submit should be handled by the root listener');
}

(async () => {
  const engine = await import('./js/reactive-engine.js');
  const { setTasksForTesting } = await import('./js/app.js');
  const list = elements.get('#task-list');
  const count = elements.get('#task-count');
  const assertCount = (total, visible) => {
    assert.equal(count.textContent, String(total));
    assert.equal(list.children.length, visible);
    assert.equal(engine.stateStore[0].length, total);
  };

  assertCount(3, 3);
  assert.deepEqual(engine.stateStore.map((_, i) => i), [0, 1], 'Two stable hook slots: tasks and filter');
  assert.deepEqual([...root.handlers.keys()].sort(), ['click', 'submit']);

  // Add via the real form submission path (clicking the submit button does this in browsers).
  input.value = '  Test new task  ';
  submit();
  assertCount(4, 4);
  assert.equal(list.children[3].children[0].children[1].textContent, 'Test new task');
  assert.equal(input.value, '');
  input.value = '   ';
  submit();
  assertCount(4, 4);

  // Nested click target must resolve to the button via closest().
  const toggle = list.children[3].children[1].children[0];
  click(toggle, true);
  assert.equal(engine.stateStore[0][3].completed, true);
  assert.equal(list.children[3].className, 'task-item is-completed');
  click(list.children[3].children[1].children[0]);
  assert.equal(engine.stateStore[0][3].completed, false);

  click(filters[1]);
  assert.equal(engine.stateStore[1], 'active');
  assertCount(4, 3);
  click(filters[2]);
  assert.equal(engine.stateStore[1], 'completed');
  assertCount(4, 1);
  click(filters[0]);
  assertCount(4, 4);

  click(list.children[3].children[1].children[1]);
  assertCount(3, 3);
  engine.resetCursor();
  engine.renderApp();
  assertCount(3, 3);
  assert.deepEqual(engine.stateStore.map((_, i) => i), [0, 1]);

  // Functional updates must reflect previous state and immediately trigger render.
  setTasksForTesting(previous => previous.slice(0, 1));
  assertCount(1, 1);
  setTasksForTesting([]);
  assertCount(0, 0);
  assert.equal(elements.get('#empty-state').hidden, false);
  assert.equal(root.handlers.size, 2);
  assert.equal(Element.listenerCount, 2, 'Only root click + submit listeners; no child listeners');
  console.log('PASS checkpoint2: useState, renderApp, add/toggle/delete/filter, counter, empty state, event delegation, no child listeners');
})().catch(error => { console.error(error); process.exitCode = 1; });
