import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { establishmentApi } from '@/modules/establishments/api/establishment.api'
import type { UpdateEstablishmentProfilePayload, UsageFilters } from '@/modules/establishments/types'

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

export function useEstablishmentUsages(filters: UsageFilters) {
  return useQuery({
    queryKey: ['establishment', 'usages', filters],
    queryFn: () => establishmentApi.usages.list(filters),
  })
}

export function useEstablishmentReport() {
  return useQuery({
    queryKey: ['establishment', 'reports'],
    queryFn: () => establishmentApi.reports.get(),
  })
}
