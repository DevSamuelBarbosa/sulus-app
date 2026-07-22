import { httpClient } from '@/shared/api/httpClient'
import type { Paginated } from '@/shared/types'
import type {
  AdminCompany,
  AdminEstablishment,
  AdminListFilters,
  AdminReport,
  AdminStats,
  AdminTenantUser,
  AdminUpdateTenantUserPayload,
  CreateCompanyPayload,
  CreateEstablishmentPayload,
  CreateTenantUserPayload,
  UpdateCompanyPayload,
  UpdateEstablishmentPayload,
} from '@/modules/admin/types'

/**
 * Flattens a create payload into FormData — only used when a `logo` file is
 * present, since Laravel needs multipart for file uploads. `null`/`undefined`
 * fields are omitted rather than sent as the strings "null"/"undefined".
 */
function toFormData(payload: object): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue
    // Laravel's `boolean` rule accepts "0"/"1" but not the strings "true"/"false".
    if (typeof value === 'boolean') {
      form.append(key, value ? '1' : '0')
      continue
    }
    form.append(key, value instanceof File ? value : String(value))
  }
  return form
}

export const adminApi = {
  async getStats(): Promise<AdminStats> {
    const { data } = await httpClient.get<{ data: AdminStats }>('/admin/stats')
    return data.data
  },

  async getReports(): Promise<AdminReport> {
    const { data } = await httpClient.get<{ data: AdminReport }>('/admin/reports')
    return data.data
  },

  companies: {
    async list(filters: AdminListFilters = {}): Promise<Paginated<AdminCompany>> {
      const { data } = await httpClient.get<Paginated<AdminCompany>>('/admin/companies', {
        params: {
          search: filters.search || undefined,
          state_id: filters.stateId ?? undefined,
          city_id: filters.cityId ?? undefined,
        },
      })
      return data
    },
    async get(id: number): Promise<AdminCompany> {
      const { data } = await httpClient.get<{ data: AdminCompany }>(`/admin/companies/${id}`)
      return data.data
    },
    async create(payload: CreateCompanyPayload): Promise<AdminCompany> {
      const body = payload.logo ? toFormData(payload) : payload
      const { data } = await httpClient.post<{ data: AdminCompany }>('/admin/companies', body)
      return data.data
    },
    async update(id: number, payload: UpdateCompanyPayload): Promise<AdminCompany> {
      const { data } = await httpClient.put<{ data: AdminCompany }>(`/admin/companies/${id}`, payload)
      return data.data
    },
    async remove(id: number): Promise<void> {
      await httpClient.delete(`/admin/companies/${id}`)
    },
    async uploadLogo(id: number, file: File): Promise<AdminCompany> {
      const form = new FormData()
      form.append('logo', file)
      const { data } = await httpClient.post<{ data: AdminCompany }>(`/admin/companies/${id}/logo`, form)
      return data.data
    },
    users: {
      async list(companyId: number): Promise<AdminTenantUser[]> {
        const { data } = await httpClient.get<{ data: AdminTenantUser[] }>(
          `/admin/companies/${companyId}/users`,
        )
        return data.data
      },
      async create(companyId: number, payload: CreateTenantUserPayload): Promise<AdminTenantUser> {
        const { data } = await httpClient.post<{ data: AdminTenantUser }>(
          `/admin/companies/${companyId}/users`,
          payload,
        )
        return data.data
      },
      async update(
        companyId: number,
        userId: number,
        payload: AdminUpdateTenantUserPayload,
      ): Promise<AdminTenantUser> {
        const { data } = await httpClient.put<{ data: AdminTenantUser }>(
          `/admin/companies/${companyId}/users/${userId}`,
          payload,
        )
        return data.data
      },
      async remove(companyId: number, userId: number): Promise<void> {
        await httpClient.delete(`/admin/companies/${companyId}/users/${userId}`)
      },
    },
  },

  establishments: {
    async list(filters: AdminListFilters = {}): Promise<Paginated<AdminEstablishment>> {
      const { data } = await httpClient.get<Paginated<AdminEstablishment>>('/admin/establishments', {
        params: {
          search: filters.search || undefined,
          state_id: filters.stateId ?? undefined,
          city_id: filters.cityId ?? undefined,
        },
      })
      return data
    },
    async get(id: number): Promise<AdminEstablishment> {
      const { data } = await httpClient.get<{ data: AdminEstablishment }>(`/admin/establishments/${id}`)
      return data.data
    },
    async create(payload: CreateEstablishmentPayload): Promise<AdminEstablishment> {
      const body = payload.logo ? toFormData(payload) : payload
      const { data } = await httpClient.post<{ data: AdminEstablishment }>('/admin/establishments', body)
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
    async uploadLogo(id: number, file: File): Promise<AdminEstablishment> {
      const form = new FormData()
      form.append('logo', file)
      const { data } = await httpClient.post<{ data: AdminEstablishment }>(
        `/admin/establishments/${id}/logo`,
        form,
      )
      return data.data
    },
    users: {
      async list(establishmentId: number): Promise<AdminTenantUser[]> {
        const { data } = await httpClient.get<{ data: AdminTenantUser[] }>(
          `/admin/establishments/${establishmentId}/users`,
        )
        return data.data
      },
      async create(establishmentId: number, payload: CreateTenantUserPayload): Promise<AdminTenantUser> {
        const { data } = await httpClient.post<{ data: AdminTenantUser }>(
          `/admin/establishments/${establishmentId}/users`,
          payload,
        )
        return data.data
      },
      async update(
        establishmentId: number,
        userId: number,
        payload: AdminUpdateTenantUserPayload,
      ): Promise<AdminTenantUser> {
        const { data } = await httpClient.put<{ data: AdminTenantUser }>(
          `/admin/establishments/${establishmentId}/users/${userId}`,
          payload,
        )
        return data.data
      },
      async remove(establishmentId: number, userId: number): Promise<void> {
        await httpClient.delete(`/admin/establishments/${establishmentId}/users/${userId}`)
      },
    },
  },
}
