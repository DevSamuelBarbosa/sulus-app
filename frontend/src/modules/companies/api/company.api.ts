import { httpClient } from '@/shared/api/httpClient'
import type { Paginated } from '@/shared/types'
import type {
  CompanyProfile,
  CreateEmployeePayload,
  Employee,
  UpdateCompanyProfilePayload,
  UpdateEmployeePayload,
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
  },

  employees: {
    async list(search = '', status = ''): Promise<Paginated<Employee>> {
      const { data } = await httpClient.get<Paginated<Employee>>('/company/employees', {
        params: { search: search || undefined, status: status || undefined },
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
}
