import type { DataGridProps } from '../types/data-grid-props'
import type { Employee } from '../types/employee'
import { employeeColumns } from './employee-columns'
import { employees } from './employees'

export const employeeGridPropsExample: DataGridProps<Employee> = {
  rows: employees,
  columns: employeeColumns,
  getRowId: (employee) => employee.id,
  caption: 'Employee directory',
  initialPageSize: 10,
  onRowSelectionChange: (employee) => {
    console.info(employee?.fullName ?? 'Selection cleared')
  },
}
