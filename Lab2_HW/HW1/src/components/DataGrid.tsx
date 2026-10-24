import { useId, useState } from 'react'
import type { DataGridProps } from '../types/data-grid-props'
import type { FilterState, SortState } from '../types/data-grid-state'
import { compareSortValues } from '../utils/sort-values'
import './DataGrid.css'

function DataGrid<T extends object>({
  rows,
  columns,
  getRowId,
  caption,
}: DataGridProps<T>) {
  const searchId = useId()
  const [filterQuery, setFilterQuery] = useState<FilterState>('')
  const [sortState, setSortState] = useState<SortState | null>(null)

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

  function handleSort(columnId: string) {
    const column = columns.find((candidate) => candidate.id === columnId)

    if (!column || !column.sortable) {
      return
    }

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
          onChange={(event) => setFilterQuery(event.target.value)}
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
          {sortedRows.length > 0 ? (
            sortedRows.map((row) => (
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
  )
}

export default DataGrid
