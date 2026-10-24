import './App.css'
import DataGrid from './components/DataGrid'
import { employeeColumns } from './data/employee-columns'
import { employees } from './data/employees'
import type { Employee } from './types/employee'

function App() {
  return (
    <div className="app-shell">
      <header className="page-header">
        <p className="page-eyebrow">Workforce directory</p>
        <h1>Employee Data Grid</h1>
        <p className="page-description">
          Review employee information in a clear, accessible data table.
        </p>
      </header>

      <main className="page-main">
        <section className="grid-section" aria-labelledby="employee-records-title">
          <div className="grid-section-heading">
            <h2 id="employee-records-title">Employee records</h2>
            <p id="grid-instructions">
              The grid will support sorting, filtering, pagination, and keyboard
              navigation.
            </p>
          </div>

          <DataGrid<Employee>
            rows={employees}
            columns={employeeColumns}
            getRowId={(employee) => employee.id}
            caption="Employee directory"
          />
        </section>
      </main>
    </div>
  )
}

export default App
