import { useQuery } from '@tanstack/react-query'
import { localizationApi } from '@/modules/localization/api/localization.api'

export function useStates() {
  return useQuery({
    queryKey: ['states'],
    queryFn: () => localizationApi.getStates(),
    staleTime: Infinity, // canonical reference data
  })
}

export function useCities(stateId: number | null, search: string) {
  return useQuery({
    queryKey: ['cities', stateId, search],
    queryFn: () => localizationApi.getCities({ stateId, search }),
    enabled: stateId !== null,
  })
}
