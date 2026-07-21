/** Shared search / filter helpers used across list views. */

export function matchesQuery(query: string, ...fields: (string | number | undefined | null)[]): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return fields.some(field => String(field ?? '').toLowerCase().includes(q))
}

export function matchesStatus<T extends string>(filter: string, value: T): boolean {
  return filter === 'all' || filter === value
}

export type FilterOption = { value: string; label: string }

export const CR_STATUS_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'held', label: 'Held in CFS' },
  { value: 'consolidated', label: 'Consolidated' },
  { value: 'loaded', label: 'Loaded' },
  { value: 'dispatched', label: 'Dispatched' },
]

export const CONSOL_STATUS_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'building', label: 'Building' },
  { value: 'sealed', label: 'Sealed' },
  { value: 'in-transit', label: 'In Transit' },
  { value: 'dispatched', label: 'Dispatched' },
]

export const LOAD_PLAN_STATUS_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'complete', label: 'Complete' },
]

export const DECONSOL_LINE_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Line Statuses' },
  { value: 'pending', label: 'Pending Release' },
  { value: 'released', label: 'Released' },
  { value: 'dispatched', label: 'Dispatched' },
]

export const DOC_STATUS_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Documents' },
  { value: 'ready', label: 'Ready' },
  { value: 'pending', label: 'Pending' },
]
