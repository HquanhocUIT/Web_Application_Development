export interface DataGridColumn<
  T extends object,
  K extends keyof T = keyof T,
> {
  id: string
  header: string
  field: K
  sortable: boolean
  filterable: boolean
  formatValue?: (value: T[K], row: T) => string
}
