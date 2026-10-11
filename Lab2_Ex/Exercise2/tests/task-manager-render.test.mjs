import assert from 'node:assert/strict';
class Element {
  constructor(tag = 'div') { this.tagName = tag; this.dataset = {}; this.children = []; this.attributes = {}; this.hidden = false; this.textContent = ''; }
  setAttribute(key, value) { this.attributes[key] = value; }
  append(...elements) { this.children.push(...elements); }
  replaceChildren(...elements) { this.children = elements; }
}
const elements = new Map([
  ['#task-list', new Element('ul')],
  ['#task-count', new Element('strong')],
  ['#empty-state', new Element('p')],
]);
globalThis.document = {
  querySelector: selector => elements.get(selector),
  createElement: tag => new Element(tag),
};
const { setTasksForTesting } = await import('../js/app.js');
const list = elements.get('#task-list');
const counter = elements.get('#task-count');
assert.equal(list.children.length, 3);
assert.equal(counter.textContent, '3');
setTasksForTesting(prev => prev.slice(1));
assert.equal(list.children.length, 2);
assert.equal(counter.textContent, '2');
assert.equal(list.children[0].dataset.taskId, 'sample-2');
setTasksForTesting([]);
assert.equal(list.children.length, 0);
assert.equal(counter.textContent, '0');
assert.equal(elements.get('#empty-state').hidden, false);
console.log('PASS: state updates re-render Task Manager list, counter, and empty state');
