import type { TenantMaster } from '@/shared/types/tenant'

export type { TenantUser as AdminTenantUser, CreateTenantUserPayload, AdminUpdateTenantUserPayload } from '@/shared/types/tenant'

export interface AdminCity {
  id: number
  name: string
  uf: string
  state_id: number
}

export interface AdminListFilters {
  search?: string
  stateId?: number | null
  cityId?: number | null
}

export interface AdminCompany {
  id: number
  master: TenantMaster | null
  legal_name: string
  trade_name: string | null
  cnpj: string
  logo_url: string | null
  phone: string | null
  contact_email: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  city_id: number | null
  city: AdminCity | null
  is_active: boolean
  created_at: string
}

export interface AdminEstablishment {
  id: number
  master: TenantMaster | null
  name: string
  cnpj: string
  category_id: number | null
  category: { id: number; name: string } | null
  description: string | null
  logo_url: string | null
  phone: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  city_id: number | null
  city: AdminCity | null
  is_active: boolean
  created_at: string
}

export interface AdminStats {
  companies_count: number
  companies_active_count: number
  establishments_count: number
  establishments_active_count: number
  employees_count: number
}

export interface AdminReport {
  total_usages: number
  usages_this_month: number
  top_companies: { name: string; count: number }[]
  top_establishments: { name: string; count: number }[]
}

interface AddressFields {
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  city_id?: number | null
}

export interface CreateCompanyPayload extends AddressFields {
  legal_name: string
  trade_name?: string | null
  cnpj: string
  phone?: string | null
  contact_email?: string | null
  is_active?: boolean
  /** Optional — only sent by the create form. Changing it later requires uploadLogo(). */
  logo?: File | null
}

export type UpdateCompanyPayload = Partial<Omit<CreateCompanyPayload, 'logo'>>

export interface CreateEstablishmentPayload extends AddressFields {
  name: string
  cnpj: string
  category_id?: number | null
  description?: string | null
  phone?: string | null
  is_active?: boolean
  /** Optional — only sent by the create form. Changing it later requires uploadLogo(). */
  logo?: File | null
}

export type UpdateEstablishmentPayload = Partial<Omit<CreateEstablishmentPayload, 'logo'>>
