import { httpClient } from '@/shared/api/httpClient'
import type { BenefitUsage, Paginated } from '@/shared/types'
import type { CreateTenantUserPayload, TenantUser, UpdateTenantUserPayload } from '@/shared/types/tenant'
import type {
  CompanyProfile,
  CompanyReport,
  CreateEmployeePayload,
  Employee,
  EmployeeFilters,
  UpdateCompanyProfilePayload,
  UpdateCompanySettingsPayload,
  UpdateEmployeePayload,
  UsageFilters,
} from '@/modules/companies/types'

export const companyApi = {
  profile: {
    async get(): Promise<CompanyProfile> {
      const { data } = await httpClient.get<{ data: CompanyProfile }>('/company/profile')
      return data.data
    },
    async update(payload: UpdateCompanyProfilePayload): Promise<CompanyProfile> {
      const { data } = await httpClient.put<{ data: CompanyProfile }>('/company/profile', payload)
      return data.data
    },
    async updateSettings(payload: UpdateCompanySettingsPayload): Promise<CompanyProfile> {
      const { data } = await httpClient.patch<{ data: CompanyProfile }>('/company/settings', payload)
      return data.data
    },
    async deleteAccount(password: string): Promise<void> {
      await httpClient.delete('/company', { data: { password } })
    },
  },

  users: {
    async list(): Promise<TenantUser[]> {
      const { data } = await httpClient.get<{ data: TenantUser[] }>('/company/users')
      return data.data
    },
    async create(payload: CreateTenantUserPayload): Promise<TenantUser> {
      const { data } = await httpClient.post<{ data: TenantUser }>('/company/users', payload)
      return data.data
    },
    async update(userId: number, payload: UpdateTenantUserPayload): Promise<TenantUser> {
      const { data } = await httpClient.put<{ data: TenantUser }>(`/company/users/${userId}`, payload)
      return data.data
    },
    async remove(userId: number): Promise<void> {
      await httpClient.delete(`/company/users/${userId}`)
    },
    async promoteMaster(userId: number, password: string): Promise<TenantUser> {
      const { data } = await httpClient.patch<{ data: TenantUser }>(
        `/company/users/${userId}/promote-master`,
        { password },
      )
      return data.data
    },
  },

  employees: {
    async list(filters: EmployeeFilters = {}): Promise<Paginated<Employee>> {
      const { data } = await httpClient.get<Paginated<Employee>>('/company/employees', {
        params: {
          search: filters.search || undefined,
          status: filters.status || undefined,
          state_id: filters.stateId ?? undefined,
          city_id: filters.cityId ?? undefined,
        },
      })
      return data
    },
    async create(payload: CreateEmployeePayload): Promise<Employee> {
      const { data } = await httpClient.post<{ data: Employee }>('/company/employees', payload)
      return data.data
    },
    async update(id: number, payload: UpdateEmployeePayload): Promise<Employee> {
      const { data } = await httpClient.put<{ data: Employee }>(`/company/employees/${id}`, payload)
      return data.data
    },
    async remove(id: number): Promise<void> {
      await httpClient.delete(`/company/employees/${id}`)
    },
    async cancelBenefit(id: number): Promise<Employee> {
      const { data } = await httpClient.patch<{ data: Employee }>(`/company/employees/${id}/cancel-benefit`)
      return data.data
    },
    async reactivateBenefit(id: number): Promise<Employee> {
      const { data } = await httpClient.patch<{ data: Employee }>(
        `/company/employees/${id}/reactivate-benefit`,
      )
      return data.data
    },
    async uploadPhoto(id: number, file: File): Promise<Employee> {
      const form = new FormData()
      form.append('photo', file)
      const { data } = await httpClient.post<{ data: Employee }>(
        `/company/employees/${id}/photo`,
        form,
      )
      return data.data
    },
  },

  usages: {
    async list(filters: UsageFilters = {}): Promise<Paginated<BenefitUsage>> {
      const { data } = await httpClient.get<Paginated<BenefitUsage>>('/company/usages', {
        params: filters,
      })
      return data
    },
  },

  reports: {
    async get(): Promise<CompanyReport> {
      const { data } = await httpClient.get<{ data: CompanyReport }>('/company/reports')
      return data.data
    },
  },
}
