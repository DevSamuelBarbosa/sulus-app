import { httpClient } from '@/shared/api/httpClient'
import type { BenefitUsage } from '@/modules/benefits/types'

export const benefitsApi = {
  async registerUsage(confirmationRef: string): Promise<BenefitUsage> {
    const { data } = await httpClient.post<{ data: BenefitUsage }>('/benefits/usages', {
      confirmation_ref: confirmationRef,
    })
    return data.data
  },
}
