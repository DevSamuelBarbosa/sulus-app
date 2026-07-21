import type { TenantRole } from '@/shared/types'

/** A company/establishment login — used by both admin and self-service tenant-user screens. */
export interface TenantUser {
  id: number
  name: string
  email: string
  tenant_role: TenantRole
  is_active: boolean
  created_at: string
}

export interface TenantMaster {
  id: number
  name: string
  email: string
}

export interface CreateTenantUserPayload {
  name: string
  email: string
  password: string
  tenant_role: 'administrador' | 'normal'
}

/** Self-service update — cannot set tenant_role to 'master' (see promote-master). */
export interface UpdateTenantUserPayload {
  name?: string
  email?: string
  tenant_role?: 'administrador' | 'normal'
}

/** Admin update — trusted to set tenant_role to 'master' directly. */
export interface AdminUpdateTenantUserPayload {
  name?: string
  email?: string
  tenant_role?: TenantRole
}
