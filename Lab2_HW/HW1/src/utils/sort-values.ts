import type { SortDirection } from '../types/data-grid-state'

const textCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

function isEmptySortValue(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '')
  )
}

/**
 * Compares strings without case sensitivity, compares numbers numerically,
 * and keeps empty values last in either direction. Equal values compare as 0;
 * a stable sort then preserves their original input order.
 */
export function compareSortValues(
  left: unknown,
  right: unknown,
  direction: SortDirection,
): number {
  const leftIsEmpty = isEmptySortValue(left)
  const rightIsEmpty = isEmptySortValue(right)

  if (leftIsEmpty && rightIsEmpty) {
    return 0
  }

  if (leftIsEmpty) {
    return 1
  }

  if (rightIsEmpty) {
    return -1
  }

  let result: number

  if (typeof left === 'number' && typeof right === 'number') {
    result = left < right ? -1 : left > right ? 1 : 0
  } else {
    result = textCollator.compare(String(left), String(right))
  }

  return direction === 'asc' ? result : -result
}
