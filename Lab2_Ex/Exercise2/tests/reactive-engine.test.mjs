import assert from 'node:assert/strict';
import { stateStore, resetCursor, renderApp, useState } from '../js/reactive-engine.js';

let output = '';
let setNumber;
let setLabel;
let passes = 0;

function render() {
  const [number, updateNumber] = useState(1);
  const [label, updateLabel] = useState('Task Manager');
  setNumber = updateNumber;
  setLabel = updateLabel;
  output = `${label}: ${number}`; // substitute for a DOM text update
  passes++;
}

renderApp(render);
assert.equal(output, 'Task Manager: 1');
assert.deepEqual(stateStore, [1, 'Task Manager']);
setNumber(4);
assert.equal(output, 'Task Manager: 4');
setNumber(previous => previous + 3);
assert.equal(output, 'Task Manager: 7');
setLabel('Updated');
assert.equal(output, 'Updated: 7');
const oldPasses = passes;
setNumber(7);
assert.equal(passes, oldPasses, 'identical state must not re-render');
resetCursor();
assert.deepEqual(stateStore, [7, 'Updated'], 'resetCursor must not clear state');
renderApp();
assert.equal(output, 'Updated: 7');
assert.equal(stateStore.length, 2, 'hook slots must remain stable');
console.log('PASS: reactive useState, callback updates, render persistence, unchanged-value bailout');
