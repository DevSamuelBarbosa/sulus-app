import type { TenantMaster } from '@/shared/types/tenant'

export interface EstablishmentCity {
  id: number
  name: string
  uf: string
  state_id: number
}

export interface EstablishmentProfile {
  id: number
  master: TenantMaster | null
  name: string
  cnpj: string
  category_id: number | null
  category: { id: number; name: string } | null
  description: string | null
  phone: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  city_id: number | null
  city: EstablishmentCity | null
  is_active: boolean
  created_at: string
}

export interface UpdateEstablishmentProfilePayload {
  name?: string
  category_id?: number | null
  description?: string | null
  phone?: string | null
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  city_id?: number | null
}

/** Master-only, password-confirmed edit of CNPJ/active status — see UpdateEstablishmentSettingsRequest (backend). */
export interface UpdateEstablishmentSettingsPayload {
  cnpj?: string
  is_active?: boolean
  password: string
}

export interface EstablishmentReport {
  total_usages: number
  usages_this_month: number
  unique_companies_count: number
  top_companies: { name: string; count: number }[]
}

export interface UsageFilters {
  search?: string
  from?: string
  to?: string
  page?: number
}
