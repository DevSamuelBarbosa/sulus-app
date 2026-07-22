import { httpClient } from '@/shared/api/httpClient'
import type { BenefitUsage, Paginated } from '@/shared/types'
import type { ActivationInfo, EmployeeProfile } from '@/modules/employees/types'
import type { LoginResponse } from '@/modules/auth/types'

export const employeeApi = {
  usages: {
    async list(page = 1): Promise<Paginated<BenefitUsage>> {
      const { data } = await httpClient.get<Paginated<BenefitUsage>>('/employee/usages', {
        params: { page },
      })
      return data
    },
  },

  profile: {
    async get(): Promise<EmployeeProfile> {
      const { data } = await httpClient.get<EmployeeProfile>('/employee/profile')
      return data
    },
  },

  activation: {
    async show(token: string): Promise<ActivationInfo> {
      const { data } = await httpClient.get<ActivationInfo>(`/employee/activation/${token}`)
      return data
    },
    async activate(token: string, password: string): Promise<LoginResponse> {
      const { data } = await httpClient.post<LoginResponse>('/employee/activation', { token, password })
      return data
    },
  },
}
