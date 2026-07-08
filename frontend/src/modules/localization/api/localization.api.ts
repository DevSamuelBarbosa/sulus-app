import { httpClient } from '@/shared/api/httpClient'
import type { City, State, ViaCepResult } from '@/modules/localization/types'

interface CityQuery {
  stateId?: number | null
  search?: string
}

export const localizationApi = {
  async getStates(): Promise<State[]> {
    const { data } = await httpClient.get<{ data: State[] }>('/states')
    return data.data
  },

  async getCities(query: CityQuery = {}): Promise<City[]> {
    const { data } = await httpClient.get<{ data: City[] }>('/cities', {
      params: {
        state_id: query.stateId ?? undefined,
        search: query.search || undefined,
      },
    })
    return data.data
  },

  /**
   * Fetch a single city by id — used to resolve/display an already-selected
   * city even when it falls outside the default search/pagination window.
   */
  async getCity(id: number): Promise<City> {
    const { data } = await httpClient.get<{ data: City }>(`/cities/${id}`)
    return data.data
  },

  /** ViaCEP lives on its own origin, so it bypasses the API httpClient. */
  async lookupCep(cep: string): Promise<ViaCepResult | null> {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) {
      return null
    }

    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!response.ok) {
      return null
    }

    const data: ViaCepResult = await response.json()
    return data.erro ? null : data
  },
}
