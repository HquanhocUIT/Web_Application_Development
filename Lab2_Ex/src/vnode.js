
/**
 * Props accepted by a Mini-React element VNode.
 *
 * `className` is the JavaScript-facing name for the HTML `class` attribute.
 * Event-handler properties, such as `onClick`, hold callback references;
 * attaching those callbacks to DOM elements is handled elsewhere.
 *
 * @typedef {Object} Props
 * @property {string} [id] - Element identifier.
 * @property {string} [role] - Accessibility role.
 * @property {string} [className] - CSS class names.
 * @property {(event: Event) => void} [onClick] - Click callback reference.
 */

/**
 * Virtual node contract for an HTML element or a text node.
 *
 * For an element, `type` is its actual HTML tag (for example, `main`,
 * `header`, `section`, or `button`). A text node uses the reserved
 * `TEXT_ELEMENT` identifier; its text data can be held in `props.nodeValue`.
 * `children` contains normalized VNodes in document order; a text VNode
 * has no children. This declaration does not perform normalization.
 *
 * @typedef {Object} VNode
 * @property {string} type - Semantic HTML tag name or `TEXT_ELEMENT`.
 * @property {Props & {nodeValue?: string}} props - Element props or text data.
 * @property {VNode[]} children - Ordered array of child VNodes.
 */
