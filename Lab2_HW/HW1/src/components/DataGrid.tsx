import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { DataGridProps } from '../types/data-grid-props'
import {
  DEFAULT_DATA_GRID_PAGE_SIZE,
  type FilterState,
  type FocusedCellState,
  type PaginationState,
  type SelectionState,
  type SortState,
} from '../types/data-grid-state'
import { paginateRows } from '../utils/paginate-rows'
import { compareSortValues } from '../utils/sort-values'
import './DataGrid.css'

type PageNavigationDirection = 'previous' | 'next'

function DataGrid<T extends object>({
  rows,
  columns,
  getRowId,
  caption,
  initialPageSize,
  onRowSelectionChange,
}: DataGridProps<T>) {
  const searchId = useId()
  const previousPageButtonRef = useRef<HTMLButtonElement>(null)
  const nextPageButtonRef = useRef<HTMLButtonElement>(null)
  const pageNavigationDirection = useRef<PageNavigationDirection | null>(null)
  const cellRefs = useRef(new Map<string, HTMLTableCellElement>())
  const [filterQuery, setFilterQuery] = useState<FilterState>('')
  const [sortState, setSortState] = useState<SortState | null>(null)
  const [focusedCell, setFocusedCell] = useState<FocusedCellState | null>(null)
  const [selectedRowId, setSelectedRowId] = useState<SelectionState>(null)
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    currentPage: 1,
    pageSize: Math.max(
      1,
      Math.floor(initialPageSize ?? DEFAULT_DATA_GRID_PAGE_SIZE),
    ),
  }))

  const normalizedFilterQuery = filterQuery.trim().toLocaleLowerCase()
  const filteredRows = normalizedFilterQuery
    ? rows.filter((row) =>
        columns.some((column) => {
          if (!column.filterable) {
            return false
          }

          const value = row[column.field]
          return String(value ?? '')
            .toLocaleLowerCase()
            .includes(normalizedFilterQuery)
        }),
      )
    : rows

  const sortColumn = sortState
    ? columns.find(
        (column) => column.id === sortState.columnId && column.sortable,
      )
    : undefined

  const sortedRows = sortColumn && sortState
    ? [...filteredRows].sort((left, right) =>
        compareSortValues(
          left[sortColumn.field],
          right[sortColumn.field],
          sortState.direction,
        ),
      )
    : filteredRows

  const pageCount = Math.max(
    1,
    Math.ceil(sortedRows.length / pagination.pageSize),
  )
  const currentPage = Math.max(
    1,
    Math.min(pagination.currentPage, pageCount),
  )
  const visibleRows = paginateRows(
    sortedRows,
    currentPage,
    pagination.pageSize,
  )
  const focusedCellIsVisible = focusedCell !== null
    && visibleRows.some((row) => getRowId(row) === focusedCell.rowId)
    && columns.some((column) => column.id === focusedCell.columnId)
  const firstVisibleRowId = visibleRows[0] ? getRowId(visibleRows[0]) : null
  const firstVisibleColumnId = columns[0]?.id ?? null
  const firstVisibleCell = firstVisibleRowId !== null && firstVisibleColumnId !== null
    ? { rowId: firstVisibleRowId, columnId: firstVisibleColumnId }
    : null
  const activeCell = focusedCellIsVisible ? focusedCell : firstVisibleCell
  const rangeStart = sortedRows.length === 0
    ? 0
    : (currentPage - 1) * pagination.pageSize + 1
  const rangeEnd = Math.min(currentPage * pagination.pageSize, sortedRows.length)

  useEffect(() => {
    const direction = pageNavigationDirection.current
    pageNavigationDirection.current = null

    if (direction === 'next' && currentPage === pageCount) {
      previousPageButtonRef.current?.focus()
    } else if (direction === 'previous' && currentPage === 1) {
      nextPageButtonRef.current?.focus()
    }
  }, [currentPage, pageCount])

  useLayoutEffect(() => {
    if (focusedCellIsVisible || focusedCell === null) {
      return
    }

    if (firstVisibleRowId === null || firstVisibleColumnId === null) {
      // The empty grid has no valid roving tab stop.
      // oxlint-disable-next-line react/set-state-in-effect
      setFocusedCell(null)
      return
    }

    const nextFocusedCell = {
      rowId: firstVisibleRowId,
      columnId: firstVisibleColumnId,
    }

    // A layout effect keeps the roving tab stop and DOM focus aligned when rows change.
    // oxlint-disable-next-line react/set-state-in-effect
    setFocusedCell(nextFocusedCell)

    const activeElement = document.activeElement
    const focusIsInGridCell = activeElement instanceof HTMLElement
      && activeElement.dataset.gridCell === 'true'
    const focusWasLostWithRemovedCell = activeElement === document.body

    if (focusIsInGridCell || focusWasLostWithRemovedCell) {
      focusGridCell(cellRefs.current, nextFocusedCell.rowId, nextFocusedCell.columnId)
    }
  }, [focusedCell, focusedCellIsVisible, firstVisibleRowId, firstVisibleColumnId])

  useEffect(() => {
    if (
      selectedRowId === null ||
      rows.some((row) => getRowId(row) === selectedRowId)
    ) {
      return
    }

    // Selection belongs to a source row, so clear it when that row is removed.
    // oxlint-disable-next-line react/set-state-in-effect
    setSelectedRowId(null)
    onRowSelectionChange?.(null)
  }, [getRowId, onRowSelectionChange, rows, selectedRowId])

  function handleRowSelection(row: T, toggle: boolean) {
    const rowId = getRowId(row)

    if (selectedRowId === rowId) {
      if (toggle) {
        setSelectedRowId(null)
        onRowSelectionChange?.(null)
      }

      return
    }

    setSelectedRowId(rowId)
    onRowSelectionChange?.(row)
  }

  function handleCellKeyDown(
    event: React.KeyboardEvent<HTMLTableCellElement>,
    row: T,
    columnId: string,
  ) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleRowSelection(row, false)
      return
    }

    if (event.key === ' ' || event.code === 'Space') {
      event.preventDefault()
      handleRowSelection(row, true)
      return
    }

    const rowId = getRowId(row)
    const rowIndex = visibleRows.findIndex((row) => getRowId(row) === rowId)
    const columnIndex = columns.findIndex((column) => column.id === columnId)
    let nextRowIndex = rowIndex
    let nextColumnIndex = columnIndex

    switch (event.key) {
      case 'ArrowUp':
        nextRowIndex -= 1
        break
      case 'ArrowDown':
        nextRowIndex += 1
        break
      case 'ArrowLeft':
        nextColumnIndex -= 1
        break
      case 'ArrowRight':
        nextColumnIndex += 1
        break
      default:
        return
    }

    event.preventDefault()

    if (
      nextRowIndex < 0 || nextRowIndex >= visibleRows.length ||
      nextColumnIndex < 0 || nextColumnIndex >= columns.length
    ) {
      return
    }

    const nextRow = visibleRows[nextRowIndex]
    const nextColumn = columns[nextColumnIndex]

    if (!nextRow || !nextColumn) {
      return
    }

    const nextCellState = {
      rowId: getRowId(nextRow),
      columnId: nextColumn.id,
    }

    setFocusedCell(nextCellState)
    focusGridCell(cellRefs.current, nextCellState.rowId, nextCellState.columnId)
  }

  function setCellRef(
    rowId: string,
    columnId: string,
    element: HTMLTableCellElement | null,
  ) {
    const refKey = getCellRefKey(rowId, columnId)

    if (element) {
      cellRefs.current.set(refKey, element)
    } else {
      cellRefs.current.delete(refKey)
    }
  }

  function handlePageChange(direction: PageNavigationDirection) {
    if (
      (direction === 'previous' && currentPage === 1) ||
      (direction === 'next' && currentPage === pageCount)
    ) {
      return
    }

    pageNavigationDirection.current = direction
    const pageOffset = direction === 'next' ? 1 : -1

    setPagination((currentPagination) => {
      const boundedPage = Math.max(
        1,
        Math.min(currentPagination.currentPage, pageCount),
      )

      return {
        ...currentPagination,
        currentPage: Math.max(1, Math.min(boundedPage + pageOffset, pageCount)),
      }
    })
  }

  function handleSort(columnId: string) {
    const column = columns.find((candidate) => candidate.id === columnId)

    if (!column || !column.sortable) {
      return
    }

    setPagination((currentPagination) => ({
      ...currentPagination,
      currentPage: 1,
    }))

    setSortState((currentSort) => {
      if (!currentSort || currentSort.columnId !== columnId) {
        return { columnId, direction: 'asc' }
      }

      if (currentSort.direction === 'asc') {
        return { columnId, direction: 'desc' }
      }

      return null
    })
  }

  return (
    <>
      <div className="data-grid-container">
        <div className="data-grid-search">
          <label className="data-grid-search-label" htmlFor={`${searchId}-input`}>
            Search records
          </label>
          <input
            className="data-grid-search-input"
            id={`${searchId}-input`}
            type="search"
            value={filterQuery}
            onChange={(event) => {
              setFilterQuery(event.target.value)
              setPagination((currentPagination) => ({
                ...currentPagination,
                currentPage: 1,
              }))
            }}
            aria-describedby={`${searchId}-help`}
          />
          <p className="data-grid-search-help" id={`${searchId}-help`}>
            Searches filterable columns only.
          </p>
        </div>
        <table
          className="data-grid-table"
          role="grid"
          aria-label={caption ? undefined : 'Data grid'}
          aria-labelledby={caption ? `${searchId}-caption` : undefined}
          aria-describedby={`${searchId}-pagination-info`}
        >
          {caption && <caption id={`${searchId}-caption`}>{caption}</caption>}
          <thead>
            <tr role="row">
              {columns.map((column) => (
                <th
                  key={column.id}
                  id={`${searchId}-column-${encodeURIComponent(column.id)}`}
                  role="columnheader"
                  scope="col"
                  aria-sort={
                    sortColumn?.id === column.id && sortState
                      ? sortState.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {column.sortable ? (
                    <button
                      className="data-grid-sort-button"
                      type="button"
                      onClick={() => handleSort(column.id)}
                      aria-label={`Sort by ${column.header}`}
                    >
                      {column.header}
                      {sortState?.columnId === column.id && (
                        <span className="data-grid-sort-indicator" aria-hidden="true">
                          {sortState.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row) => {
                const rowId = getRowId(row)
                const isSelected = selectedRowId === rowId

                return (
                  <tr
                    key={rowId}
                    role="row"
                    className={isSelected ? 'data-grid-row--selected' : undefined}
                    aria-selected={isSelected}
                  >
                    {columns.map((column) => {
                      const value = row[column.field]
                      const displayValue = column.formatValue
                        ? column.formatValue(value, row)
                        : String(value ?? '')

                      return (
                        <td
                          key={column.id}
                          role="gridcell"
                          headers={`${searchId}-column-${encodeURIComponent(column.id)}`}
                          ref={(element) => setCellRef(rowId, column.id, element)}
                          tabIndex={
                            activeCell?.rowId === rowId &&
                            activeCell.columnId === column.id
                              ? 0
                              : -1
                          }
                          data-grid-cell="true"
                          onFocus={() => setFocusedCell({ rowId, columnId: column.id })}
                          onKeyDown={(event) =>
                            handleCellKeyDown(event, row, column.id)
                          }
                        >
                          {isSelected && column.id === columns[0]?.id && (
                            <span className="data-grid-selection-label">
                              Selected
                            </span>
                          )}
                          {displayValue}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            ) : (
              <tr role="row">
                <td role="gridcell" colSpan={Math.max(columns.length, 1)}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <nav className="data-grid-pagination" aria-label="Table pagination">
        <div
          className="data-grid-pagination-info"
          id={`${searchId}-pagination-info`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p>Page {currentPage} of {pageCount}</p>
          <p>
            {sortedRows.length > 0
              ? `Showing ${rangeStart}–${rangeEnd} of ${sortedRows.length} records`
              : 'No records to show'}
          </p>
        </div>
        <div className="data-grid-pagination-actions">
          <button
            ref={previousPageButtonRef}
            className="data-grid-pagination-button"
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => handlePageChange('previous')}
          >
            Previous
          </button>
          <button
            ref={nextPageButtonRef}
            className="data-grid-pagination-button"
            type="button"
            aria-label="Next page"
            disabled={currentPage === pageCount}
            onClick={() => handlePageChange('next')}
          >
            Next
          </button>
        </div>
      </nav>
    </>
  )
}

function getCellRefKey(rowId: string, columnId: string) {
  return JSON.stringify([rowId, columnId])
}

function focusGridCell(
  cells: Map<string, HTMLTableCellElement>,
  rowId: string,
  columnId: string,
) {
  const cell = cells.get(getCellRefKey(rowId, columnId))

  if (!cell) {
    return
  }

  cell.focus({ preventScroll: true })
  cell.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

export default DataGrid
