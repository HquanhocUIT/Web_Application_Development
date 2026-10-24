/** A single active sorting direction. A null DataGridState.sort means no sort. */
export type SortDirection = 'asc' | 'desc'

/** The sortable column and direction currently applied to the rows. */
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
 * - Only a column with sortable: true can be sorted; one column is sorted at a time.
 * - Clicking the active column cycles none -> ascending -> descending -> none.
 *   Clicking a different sortable column starts it in ascending order.
 * - Filter rows first, sort the filtered rows second, and paginate last. Changing
 *   the filter query or sort resets the current page to 1.
 * - Sort a copy of the source rows so sorting never mutates the rows prop.
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
