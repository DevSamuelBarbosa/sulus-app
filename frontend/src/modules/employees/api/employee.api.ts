import { httpClient } from '@/shared/api/httpClient'
import type { BenefitUsage, Paginated } from '@/shared/types'

export const employeeApi = {
  usages: {
    async list(page = 1): Promise<Paginated<BenefitUsage>> {
      const { data } = await httpClient.get<Paginated<BenefitUsage>>('/employee/usages', {
        params: { page },
      })
      return data
    },
  },
}
