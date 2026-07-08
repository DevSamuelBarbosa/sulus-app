export interface QrToken {
  token: string
  expires_in: number
}

export type QrTokenStatus = 'pending' | 'validated' | 'used' | 'expired'

export interface EmployeeCheck {
  full_name: string
  photo_url: string | null
  company_name: string
}

export interface QrValidation {
  confirmation_ref: string
  expires_in: number
  employee: EmployeeCheck
}
