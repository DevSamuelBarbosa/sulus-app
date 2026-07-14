import { httpClient } from '@/shared/api/httpClient'
import type { AuthUser, LoginPayload, LoginResponse } from '@/modules/auth/types'

// NOTE: these endpoints are implemented in Fase 1 (Auth & Admin).
export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await httpClient.post<LoginResponse>('/auth/login', payload)
    return data
  },

  async me(): Promise<AuthUser> {
    const { data } = await httpClient.get<{ data: AuthUser }>('/auth/me')
    return data.data
  },

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout')
  },

  async impersonate(userId: number): Promise<LoginResponse> {
    const { data } = await httpClient.post<LoginResponse>(`/admin/impersonate/${userId}`)
    return data
  },

  async stopImpersonation(): Promise<LoginResponse> {
    const { data } = await httpClient.delete<LoginResponse>('/admin/impersonate')
    return data
  },
}
