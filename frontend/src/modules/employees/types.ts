export interface EmployeeProfile {
  employee: {
    id: number
    full_name: string
    benefit_status: 'active' | 'cancelled'
  }
  company: {
    id: number
    trade_name: string
    logo_url: string | null
  }
}

export interface ActivationInfo {
  name: string
  email: string
}
