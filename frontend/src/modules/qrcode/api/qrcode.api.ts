import { httpClient } from '@/shared/api/httpClient'
import type { QrToken, QrTokenStatus, QrValidation } from '@/modules/qrcode/types'

export const qrcodeApi = {
  async generate(): Promise<QrToken> {
    const { data } = await httpClient.post<QrToken>('/qrcode/generate')
    return data
  },

  async validate(token: string): Promise<QrValidation> {
    const { data } = await httpClient.post<QrValidation>('/qrcode/validate', { token })
    return data
  },

  async status(token: string): Promise<{ status: QrTokenStatus }> {
    const { data } = await httpClient.get<{ status: QrTokenStatus }>(`/qrcode/status/${token}`)
    return data
  },
}
