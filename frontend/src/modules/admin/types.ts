export interface AdminCity {
  id: number
  name: string
  uf: string
  state_id: number
}

export interface AdminCompany {
  id: number
  user_id: number
  login_email: string
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
  city: AdminCity | null
  is_active: boolean
  created_at: string
}

export interface AdminEstablishment {
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

interface AddressFields {
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  city_id?: number | null
}

export interface CreateCompanyPayload extends AddressFields {
  user_name: string
  email: string
  password: string
  legal_name: string
  trade_name?: string | null
  cnpj: string
  phone?: string | null
  contact_email?: string | null
  is_active?: boolean
}

export type UpdateCompanyPayload = Partial<Omit<CreateCompanyPayload, 'user_name' | 'email' | 'password'>>

export interface CreateEstablishmentPayload extends AddressFields {
  user_name: string
  email: string
  password: string
  name: string
  cnpj: string
  category_id?: number | null
  description?: string | null
  phone?: string | null
  is_active?: boolean
}

export type UpdateEstablishmentPayload = Partial<
  Omit<CreateEstablishmentPayload, 'user_name' | 'email' | 'password'>
>
