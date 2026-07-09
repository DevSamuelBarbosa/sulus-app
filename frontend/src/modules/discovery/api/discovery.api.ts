import { httpClient } from '@/shared/api/httpClient'
import type { Paginated } from '@/shared/types'
import type {
  CompanySearchParams,
  CompanySummary,
  EstablishmentSearchParams,
  EstablishmentSummary,
} from '@/modules/discovery/types'

export const discoveryApi = {
  async listEstablishments(params: EstablishmentSearchParams): Promise<Paginated<EstablishmentSummary>> {
    const { data } = await httpClient.get<Paginated<EstablishmentSummary>>('/establishments', {
      params: {
        search: params.search || undefined,
        category_id: params.category_id ?? undefined,
        city_id: params.city_id ?? undefined,
        state_id: params.state_id ?? undefined,
        page: params.page ?? undefined,
      },
    })
    return data
  },

  async getEstablishment(id: number): Promise<EstablishmentSummary> {
    const { data } = await httpClient.get<{ data: EstablishmentSummary }>(`/establishments/${id}`)
    return data.data
  },

  async listCompanies(params: CompanySearchParams): Promise<Paginated<CompanySummary>> {
    const { data } = await httpClient.get<Paginated<CompanySummary>>('/companies', {
      params: {
        search: params.search || undefined,
        city_id: params.city_id ?? undefined,
        state_id: params.state_id ?? undefined,
        page: params.page ?? undefined,
      },
    })
    return data
  },
}
