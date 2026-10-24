/** Returns the rows for a one-based page without changing the input array. */
export function paginateRows<T>(
  rows: readonly T[],
  currentPage: number,
  pageSize: number,
): T[] {
  const startIndex = (currentPage - 1) * pageSize

  return rows.slice(startIndex, startIndex + pageSize)
}
