export type EmploymentStatus = 'Active' | 'On Leave' | 'Inactive'

export interface Employee {
  id: string
  fullName: string
  email: string
  department: string
  jobTitle: string
  status: EmploymentStatus
}
