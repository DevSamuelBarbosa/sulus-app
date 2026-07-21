import type { TenantMaster } from '@/shared/types/tenant'

export interface CompanyCity {
  id: number
  name: string
  uf: string
  state_id: number
}

export interface CompanyProfile {
  id: number
  master: TenantMaster | null
  legal_name: string
  trade_name: string | null
  cnpj: string
  phone: string | null
  contact_email: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  city_id: number | null
  city: CompanyCity | null
  is_active: boolean
  created_at: string
}

export interface UpdateCompanyProfilePayload {
  legal_name?: string
  trade_name?: string | null
  phone?: string | null
  contact_email?: string | null
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  city_id?: number | null
}

/** Master-only, password-confirmed edit of CNPJ/active status — see UpdateCompanySettingsRequest (backend). */
export interface UpdateCompanySettingsPayload {
  cnpj?: string
  is_active?: boolean
  password: string
}

export type BenefitStatus = 'active' | 'cancelled'

export interface Employee {
  id: number
  company_id: number
  login_email: string
  full_name: string
  cpf: string
  phone: string | null
  photo_url: string | null
  benefit_status: BenefitStatus
  benefit_status_label: string
  hired_at: string | null
  city_id: number | null
  city: CompanyCity | null
  created_at: string
}

export interface CreateEmployeePayload {
  email: string
  password: string
  full_name: string
  cpf: string
  phone?: string | null
  hired_at?: string | null
  city_id?: number | null
}

export interface UpdateEmployeePayload {
  full_name?: string
  cpf?: string
  phone?: string | null
  hired_at?: string | null
  city_id?: number | null
}

export interface CompanyReport {
  total_usages: number
  usages_this_month: number
  active_employees_count: number
  top_establishments: { name: string; count: number }[]
}

export interface EmployeeFilters {
  search?: string
  status?: string
  stateId?: number | null
  cityId?: number | null
}

export interface UsageFilters {
  search?: string
  employee_id?: number
  from?: string
  to?: string
  page?: number
}
