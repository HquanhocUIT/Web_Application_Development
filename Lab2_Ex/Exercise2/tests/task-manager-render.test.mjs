import assert from 'node:assert/strict';
class Element {
  constructor(tag = 'div') { this.tagName = tag; this.dataset = {}; this.children = []; this.attributes = {}; this.hidden = false; this.textContent = ''; this.value = ''; this.id = ''; this.handlers = new Map(); this.classList = { toggle: () => {} }; }
  setAttribute(key, value) { this.attributes[key] = value; }
  append(...elements) { this.children.push(...elements); }
  replaceChildren(...elements) { this.children = elements; }
  addEventListener(type, handler) { assert.equal(this.handlers.has(type), false, `duplicate ${type} listener`); this.handlers.set(type, handler); }
  querySelectorAll() { return filters; }
  contains(node) { return node !== null; }
  closest() { return this; }
}
const root = new Element('section');
const input = new Element('input');
const filters = ['all', 'active', 'completed'].map(filter => { const element = new Element('button'); element.dataset = { action: 'filter', filter }; return element; });
const elements = new Map([
  ['#task-app', root], ['#new-task-input', input],
  ['#task-list', new Element('ul')],
  ['#task-count', new Element('strong')],
  ['#empty-state', new Element('p')],
]);
globalThis.document = { querySelector: selector => elements.get(selector), createElement: tag => new Element(tag) };
const { setTasksForTesting } = await import('../js/app.js');
const list = elements.get('#task-list');
const counter = elements.get('#task-count');
const click = button => root.handlers.get('click')({ target: { closest: () => button } });
const submit = () => { let prevented = false; root.handlers.get('submit')({ target: { id: 'add-task-form' }, preventDefault() { prevented = true; } }); assert.equal(prevented, true); };
assert.equal(list.children.length, 3);
assert.equal(counter.textContent, '3');
assert.deepEqual([...root.handlers.keys()].sort(), ['click', 'submit']);
click(filters[1]);
assert.equal(list.children.length, 2);
assert.equal(filters[1].attributes['aria-pressed'], 'true');
click(filters[2]);
assert.equal(list.children.length, 1);
click(filters[0]);
assert.equal(list.children.length, 3);
const first = list.children[0];
click(first.children[1].children[0]); // complete via delegated button
assert.equal(list.children[0].className.includes('is-completed'), true);
click(list.children[0].children[1].children[1]); // delete via delegated button
assert.equal(list.children.length, 2);
assert.equal(counter.textContent, '2');
input.value = '  New delegated task  ';
submit();
assert.equal(list.children.length, 3);
assert.equal(list.children[2].children[0].children[1].textContent, 'New delegated task');
assert.equal(input.value, '');
input.value = '   ';
submit();
assert.equal(list.children.length, 3);
setTasksForTesting([]);
assert.equal(list.children.length, 0);
assert.equal(counter.textContent, '0');
assert.equal(elements.get('#empty-state').hidden, false);
assert.equal(root.handlers.size, 2);
console.log('PASS: root events, task actions, filters, reactive DOM updates, no duplicate listeners');
