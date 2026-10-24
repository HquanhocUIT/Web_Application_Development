import type { DataGridColumn } from './data-grid-column'

/**
 * Props passed from a parent to a reusable DataGrid<T> component.
 * Sorting, filtering, pagination, focused-cell, and selected-row state belong
 * inside DataGrid. The callback only notifies the parent about selection changes.
 * See ../data/employee-grid-example.ts for a type-checked Employee example.
 */
export interface DataGridProps<T extends object> {
  /** Row records supplied by the parent. */
  rows: T[]

  /** Column definitions supplied by the parent. */
  columns: DataGridColumn<T>[]

  /** Returns a unique, stable ID for each row. */
  getRowId: (row: T) => string

  /** Optional table caption. Default: undefined. */
  caption?: string

  /** Initial number of rows per page. Default: 10. */
  initialPageSize?: number

  /** Notifies the parent when selection changes; null means the selection was cleared. */
  onRowSelectionChange?: (selectedRow: T | null) => void
}
