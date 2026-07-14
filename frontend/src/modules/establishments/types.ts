export interface EstablishmentCity {
  id: number
  name: string
  uf: string
  state_id: number
}

export interface EstablishmentProfile {
  id: number
  user_id: number
  login_email: string
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
