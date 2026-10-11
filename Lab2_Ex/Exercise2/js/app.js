/**
 * Task Manager — reactive state and root-level event delegation.
 */
import { renderApp, useState } from './reactive-engine.js';

const initialTasks = [
  { id: 'sample-1', title: 'Review Web Engineering lecture notes', completed: false },
  { id: 'sample-2', title: 'Create project structure', completed: true },
  { id: 'sample-3', title: 'Plan reactive state implementation', completed: false },
];

const root = document.querySelector('#task-app');
const taskInput = document.querySelector('#new-task-input');
const filterButtons = root.querySelectorAll('[data-action="filter"]');
const taskList = document.querySelector('#task-list');
const taskCount = document.querySelector('#task-count');
const emptyState = document.querySelector('#empty-state');

function makeTaskItem(task) {
  const item = document.createElement('li');
  item.className = task.completed ? 'task-item is-completed' : 'task-item';
  item.dataset.taskId = task.id;

  const content = document.createElement('span');
  content.className = 'task-content';
  const check = document.createElement('span');
  check.className = 'task-check';
  check.setAttribute('aria-hidden', 'true');
  check.textContent = task.completed ? '✓' : '';
  const label = document.createElement('span');
  label.className = 'task-label';
  label.textContent = task.title;
  content.append(check, label);

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  for (const [action, symbol, accessibleName, tooltip, className] of [
    ['toggle', task.completed ? '↶' : '✓', `${task.completed ? 'Mark' : 'Complete'} ${task.title}${task.completed ? ' active' : ''}`, task.completed ? 'Mark active' : 'Mark completed', 'complete-button'],
    ['delete', '×', `Delete ${task.title}`, 'Delete task', 'delete-button'],
  ]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `icon-button ${className}`;
    button.dataset.action = action;
    button.dataset.id = task.id;
    button.setAttribute('aria-label', accessibleName);
    button.title = tooltip;
    button.textContent = symbol;
    actions.append(button);
  }
  item.append(content, actions);
  return item;
}

let updateTasks;
let updateFilter;
let nextTaskId = 0;

function render() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('all');
  updateTasks = setTasks;
  updateFilter = setFilter;
  const visibleTasks = tasks.filter(task => filter === 'all' || (filter === 'completed' ? task.completed : !task.completed));
  for (const button of filterButtons) {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  taskCount.textContent = String(tasks.length);
  taskList.replaceChildren(...visibleTasks.map(makeTaskItem));
  emptyState.hidden = visibleTasks.length !== 0;
}

// One listener per event type on the stable root, never inside render().
root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button || !root.contains(button)) return;

  const { action, id, filter } = button.dataset;
  switch (action) {
    case 'add':
      // Form submission handles mouse, keyboard and assistive technology equally.
      break;
    case 'toggle':
      updateTasks(previous => previous.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
      break;
    case 'delete':
      updateTasks(previous => previous.filter(task => task.id !== id));
      break;
    case 'filter':
      if (['all', 'active', 'completed'].includes(filter)) updateFilter(filter);
      break;
    default:
      break;
  }
});

// A single submit listener on the root also supports Enter in the task input.
root.addEventListener('submit', (event) => {
  if (event.target.id !== 'add-task-form') return;
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  updateTasks(previous => [...previous, {
    id: `task-${++nextTaskId}-${Date.now()}`,
    title,
    completed: false,
  }]);
  taskInput.value = '';
});

renderApp(render);

// A programmatic entry point to verify reactive UI updates before wiring events.
// Example in browser console after importing app.js: setTasksForTesting(prev => prev.slice(1));
export function setTasksForTesting(update) {
  updateTasks(update);
}
