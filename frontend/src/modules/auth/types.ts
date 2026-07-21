import type { Role, TenantRole } from '@/shared/types'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: Role
  tenant_role: TenantRole | null
  impersonated_by: { id: number; name: string } | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}
