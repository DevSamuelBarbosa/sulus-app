export interface DiscoveryCity {
  id: number
  name: string
  uf: string
  state_id: number
}

export interface EstablishmentSummary {
  id: number
  name: string
  category: { id: number; name: string } | null
  description: string | null
  phone: string | null
  logo_url: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cep: string | null
  city: DiscoveryCity | null
}

export interface CompanySummary {
  id: number
  legal_name: string
  trade_name: string | null
  phone: string | null
  logo_url: string | null
  city: DiscoveryCity | null
}

export interface EstablishmentSearchParams {
  search?: string
  category_id?: number | null
  city_id?: number | null
  state_id?: number | null
  page?: number
}

export interface CompanySearchParams {
  search?: string
  city_id?: number | null
  state_id?: number | null
  page?: number
}
