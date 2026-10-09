
/**
 * Lab 2: Modern React Architecture, Virtual DOM & State Machines
 * Exercise 1: Mini-React VNode & Mounting Engine
 *
 * Task 1.1: Define VNode & Props Contracts
 * Task 1.2: Implement createTextElement() Factory
 *
 * This module defines the data structures used by the Mini-React engine
 * and provides a factory for creating text VNodes.
 */

/**
 * Represents the properties of a virtual DOM element.
 *
 * @typedef {Object} Props
 * @property {string} [id] - HTML element identifier.
 * @property {string} [role] - Accessibility role.
 * @property {string} [className] - CSS class names.
 * @property {function(Event): void} [onClick] - Click event handler.
 *
 * Additional standard HTML attributes and event handler references
 * may be stored as properties.
 */

/**
 * Represents a virtual DOM node.
 *
 * Element VNodes use an HTML tag name as their type.
 * Text VNodes use the identifier "TEXT_ELEMENT".
 *
 * @typedef {Object} VNode
 * @property {string} type - HTML tag name or "TEXT_ELEMENT".
 * @property {Props} props - Element attributes and event handlers.
 * @property {VNode[]} children - Ordered array of child VNodes.
 *
 * For text VNodes, props.nodeValue stores the text content.
 */

/**
 * Represents the properties of a text VNode.
 *
 * @typedef {Props & {nodeValue: string}} TextProps
 */

/**
 * Represents a text VNode.
 *
 * @typedef {VNode & {
 *   type: "TEXT_ELEMENT",
 *   props: TextProps,
 *   children: []
 * }} TextVNode
 */

/**
 * Creates a text VNode from a string or number.
 *
 * The value is converted to a string and stored as plain text data.
 * No HTML parsing or DOM manipulation is performed.
 *
 * @param {string | number} value - Text content to represent.
 * @returns {TextVNode} A text virtual DOM node.
 */
export function createTextElement(value) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: String(value),
    },
    children: [],
  };
}
