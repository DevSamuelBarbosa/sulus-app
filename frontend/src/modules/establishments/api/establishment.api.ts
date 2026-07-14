import { httpClient } from '@/shared/api/httpClient'
import type { BenefitUsage, Paginated } from '@/shared/types'
import type {
  EstablishmentProfile,
  EstablishmentReport,
  UpdateEstablishmentProfilePayload,
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
