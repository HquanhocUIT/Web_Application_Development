import type { DataGridColumn } from '../types/data-grid-column'
import type { Employee } from '../types/employee'

export const employeeColumns: DataGridColumn<Employee>[] = [
  {
    id: 'employee-id',
    header: 'Employee ID',
    field: 'id',
    sortable: true,
    filterable: true,
  },
  {
    id: 'full-name',
    header: 'Full name',
    field: 'fullName',
    sortable: true,
    filterable: true,
  },
  {
    id: 'email',
    header: 'Email address',
    field: 'email',
    sortable: true,
    filterable: true,
  },
  {
    id: 'department',
    header: 'Department',
    field: 'department',
    sortable: true,
    filterable: true,
  },
  {
    id: 'job-title',
    header: 'Job title',
    field: 'jobTitle',
    sortable: true,
    filterable: true,
  },
  {
    id: 'employment-status',
    header: 'Employment status',
    field: 'status',
    sortable: true,
    filterable: true,
  },
]
