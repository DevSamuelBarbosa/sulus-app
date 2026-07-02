import type { Role } from '@/shared/types'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: Role
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}
