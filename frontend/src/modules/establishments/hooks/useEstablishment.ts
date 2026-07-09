import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { establishmentApi } from '@/modules/establishments/api/establishment.api'
import type { UpdateEstablishmentProfilePayload } from '@/modules/establishments/types'

export function useEstablishmentProfile() {
  return useQuery({
    queryKey: ['establishment', 'profile'],
    queryFn: () => establishmentApi.profile.get(),
  })
}

export function useUpdateEstablishmentProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateEstablishmentProfilePayload) => establishmentApi.profile.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['establishment', 'profile'] })
    },
  })
}
