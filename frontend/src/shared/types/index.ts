export type Role = 'admin' | 'company' | 'employee' | 'establishment'

export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface BenefitUsage {
  id: number
  employee_name: string
  company_name: string
  establishment_name: string | null
  used_at: string
}

export interface ApiError {
  message: string
  code?: string
  errors?: Record<string, string[]>
}
