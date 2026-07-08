export interface CompanyCity {
  id: number
  name: string
  uf: string
  state_id: number
}

export interface CompanyProfile {
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
  created_at: string
}

export interface CreateEmployeePayload {
  email: string
  password: string
  full_name: string
  cpf: string
  phone?: string | null
  hired_at?: string | null
}

export interface UpdateEmployeePayload {
  full_name?: string
  cpf?: string
  phone?: string | null
  hired_at?: string | null
}
