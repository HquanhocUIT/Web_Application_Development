export type SortDirection = 'asc' | 'desc'

export interface SortState {
  columnId: string
  direction: SortDirection
}

export type FilterState = string

export interface PaginationState {
  currentPage: number
  pageSize: number
}

export interface FocusedCellState {
  rowId: string
  columnId: string
}

export type SelectionState = string | null

export interface DataGridState {
  sort: SortState | null
  filterQuery: FilterState
  pagination: PaginationState
  focusedCell: FocusedCellState | null
  selectedRowId: SelectionState
}

export const DEFAULT_DATA_GRID_PAGE_SIZE = 10

/**
 * State starts with no sort, an empty filter, page 1, the configured page size
 * (or DEFAULT_DATA_GRID_PAGE_SIZE), no focused cell, and no selected row.
 *
 * Transition rules for the DataGrid component:
 * - Filter rows by the query in filterable columns, sort the result, then paginate.
 * - Cycle sort as none -> ascending -> descending -> none; a new column starts ascending.
 *   Changing the query or sort resets the current page to 1.
 * - Keep the current page within 1..pageCount after data or page-size changes.
 *   Empty results stay on page 1 with no focused cell.
 * - Arrow keys move one visible cell; stop at grid edges without wrapping.
 *   Enter selects the focused row; Space toggles that row's selection.
 * - Keep focus by rowId and columnId when that cell remains visible. Otherwise,
 *   focus the first cell on the current page; page changes focus the first page cell.
 * - Keep selection by row ID across sorting, filtering, and pagination while the
 *   row still exists in the source rows; clear it if that row is removed.
 *
 * Filtered rows, sorted rows, page count, and visible rows are derived values,
 * not additional React state.
 */
