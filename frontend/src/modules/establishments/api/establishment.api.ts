import { httpClient } from '@/shared/api/httpClient'
import type { BenefitUsage, Paginated } from '@/shared/types'
import type { CreateTenantUserPayload, TenantUser, UpdateTenantUserPayload } from '@/shared/types/tenant'
import type {
  EstablishmentProfile,
  EstablishmentReport,
  UpdateEstablishmentProfilePayload,
  UpdateEstablishmentSettingsPayload,
  UsageFilters,
} from '@/modules/establishments/types'

export const establishmentApi = {
  profile: {
    async get(): Promise<EstablishmentProfile> {
      const { data } = await httpClient.get<{ data: EstablishmentProfile }>('/establishment/profile')
      return data.data
    },
    async update(payload: UpdateEstablishmentProfilePayload): Promise<EstablishmentProfile> {
      const { data } = await httpClient.put<{ data: EstablishmentProfile }>(
        '/establishment/profile',
        payload,
      )
      return data.data
    },
    async updateSettings(payload: UpdateEstablishmentSettingsPayload): Promise<EstablishmentProfile> {
      const { data } = await httpClient.patch<{ data: EstablishmentProfile }>(
        '/establishment/settings',
        payload,
      )
      return data.data
    },
    async deleteAccount(password: string): Promise<void> {
      await httpClient.delete('/establishment', { data: { password } })
    },
  },

  users: {
    async list(): Promise<TenantUser[]> {
      const { data } = await httpClient.get<{ data: TenantUser[] }>('/establishment/users')
      return data.data
    },
    async create(payload: CreateTenantUserPayload): Promise<TenantUser> {
      const { data } = await httpClient.post<{ data: TenantUser }>('/establishment/users', payload)
      return data.data
    },
    async update(userId: number, payload: UpdateTenantUserPayload): Promise<TenantUser> {
      const { data } = await httpClient.put<{ data: TenantUser }>(`/establishment/users/${userId}`, payload)
      return data.data
    },
    async remove(userId: number): Promise<void> {
      await httpClient.delete(`/establishment/users/${userId}`)
    },
    async promoteMaster(userId: number, password: string): Promise<TenantUser> {
      const { data } = await httpClient.patch<{ data: TenantUser }>(
        `/establishment/users/${userId}/promote-master`,
        { password },
      )
      return data.data
    },
  },

  usages: {
    async list(filters: UsageFilters = {}): Promise<Paginated<BenefitUsage>> {
      const { data } = await httpClient.get<Paginated<BenefitUsage>>('/establishment/usages', {
        params: filters,
      })
      return data
    },
  },

  reports: {
    async get(): Promise<EstablishmentReport> {
      const { data } = await httpClient.get<{ data: EstablishmentReport }>('/establishment/reports')
      return data.data
    },
  },
}
