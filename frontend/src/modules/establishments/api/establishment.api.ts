import { httpClient } from '@/shared/api/httpClient'
import type { EstablishmentProfile, UpdateEstablishmentProfilePayload } from '@/modules/establishments/types'

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
}
