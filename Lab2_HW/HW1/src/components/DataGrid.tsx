import type { DataGridProps } from '../types/data-grid-props'
import './DataGrid.css'

function DataGrid<T extends object>({
  rows,
  columns,
  getRowId,
  caption,
}: DataGridProps<T>) {
  return (
    <div className="data-grid-container">
      <table className="data-grid-table">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id} scope="col">
                {column.sortable ? (
                  <button
                    className="data-grid-sort-button"
                    type="button"
                    disabled
                  >
                    {column.header}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
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
