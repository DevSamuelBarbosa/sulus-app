import { httpClient } from '@/shared/api/httpClient'
import type { Paginated } from '@/shared/types'
import type {
  AdminCompany,
  AdminEstablishment,
  AdminStats,
  CreateCompanyPayload,
  CreateEstablishmentPayload,
  UpdateCompanyPayload,
  UpdateEstablishmentPayload,
} from '@/modules/admin/types'

export const adminApi = {
  async getStats(): Promise<AdminStats> {
    const { data } = await httpClient.get<{ data: AdminStats }>('/admin/stats')
    return data.data
  },

  companies: {
    async list(search = ''): Promise<Paginated<AdminCompany>> {
      const { data } = await httpClient.get<Paginated<AdminCompany>>('/admin/companies', {
        params: { search: search || undefined },
      })
      return data
    },
    async create(payload: CreateCompanyPayload): Promise<AdminCompany> {
      const { data } = await httpClient.post<{ data: AdminCompany }>('/admin/companies', payload)
      return data.data
    },
    async update(id: number, payload: UpdateCompanyPayload): Promise<AdminCompany> {
      const { data } = await httpClient.put<{ data: AdminCompany }>(`/admin/companies/${id}`, payload)
      return data.data
    },
    async remove(id: number): Promise<void> {
      await httpClient.delete(`/admin/companies/${id}`)
    },
  },

  establishments: {
    async list(search = ''): Promise<Paginated<AdminEstablishment>> {
      const { data } = await httpClient.get<Paginated<AdminEstablishment>>('/admin/establishments', {
        params: { search: search || undefined },
      })
      return data
    },
    async create(payload: CreateEstablishmentPayload): Promise<AdminEstablishment> {
      const { data } = await httpClient.post<{ data: AdminEstablishment }>('/admin/establishments', payload)
      return data.data
    },
    async update(id: number, payload: UpdateEstablishmentPayload): Promise<AdminEstablishment> {
      const { data } = await httpClient.put<{ data: AdminEstablishment }>(
        `/admin/establishments/${id}`,
        payload,
      )
      return data.data
    },
    async remove(id: number): Promise<void> {
      await httpClient.delete(`/admin/establishments/${id}`)
    },
  },
}
