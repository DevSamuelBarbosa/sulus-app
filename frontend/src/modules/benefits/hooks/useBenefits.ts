import { useMutation } from '@tanstack/react-query'
import { qrcodeApi } from '@/modules/qrcode/api/qrcode.api'
import { benefitsApi } from '@/modules/benefits/api/benefits.api'

export function useValidateQrToken() {
  return useMutation({
    mutationFn: (token: string) => qrcodeApi.validate(token),
  })
}

export function useRegisterBenefitUsage() {
  return useMutation({
    mutationFn: (confirmationRef: string) => benefitsApi.registerUsage(confirmationRef),
  })
}
