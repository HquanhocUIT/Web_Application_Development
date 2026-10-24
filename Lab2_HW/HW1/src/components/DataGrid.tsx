import { useEffect, useId, useRef, useState } from 'react'
import type { DataGridProps } from '../types/data-grid-props'
import {
  DEFAULT_DATA_GRID_PAGE_SIZE,
  type FilterState,
  type PaginationState,
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
}: DataGridProps<T>) {
  const searchId = useId()
  const previousPageButtonRef = useRef<HTMLButtonElement>(null)
  const nextPageButtonRef = useRef<HTMLButtonElement>(null)
  const pageNavigationDirection = useRef<PageNavigationDirection | null>(null)
  const [filterQuery, setFilterQuery] = useState<FilterState>('')
  const [sortState, setSortState] = useState<SortState | null>(null)
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
        <table className="data-grid-table">
          {caption && <caption>{caption}</caption>}
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
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
              visibleRows.map((row) => (
                <tr key={getRowId(row)}>
                  {columns.map((column) => {
                    const value = row[column.field]
                    const displayValue = column.formatValue
                      ? column.formatValue(value, row)
                      : String(value ?? '')

                    return <td key={column.id}>{displayValue}</td>
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={Math.max(columns.length, 1)}>No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <nav className="data-grid-pagination" aria-label="Table pagination">
        <div
          className="data-grid-pagination-info"
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

export default DataGrid
