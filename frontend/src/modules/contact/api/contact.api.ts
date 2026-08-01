import { httpClient } from '@/shared/api/httpClient'
import type { MessageResponse } from '@/modules/auth/types'
import type { ContactPayload } from '@/modules/contact/types'

export const contactApi = {
  async submit(payload: ContactPayload): Promise<MessageResponse> {
    const { data } = await httpClient.post<MessageResponse>('/contact', payload)
    return data
  },
}
