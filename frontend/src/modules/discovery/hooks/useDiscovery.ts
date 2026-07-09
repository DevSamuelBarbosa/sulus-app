import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { discoveryApi } from '@/modules/discovery/api/discovery.api'
import type { CompanySearchParams, EstablishmentSearchParams } from '@/modules/discovery/types'

export function useEstablishmentsDiscovery(params: EstablishmentSearchParams) {
  return useQuery({
    queryKey: ['discovery', 'establishments', params],
    queryFn: () => discoveryApi.listEstablishments(params),
    placeholderData: keepPreviousData,
  })
}

export function useEstablishmentProfile(id: number | null) {
  return useQuery({
    queryKey: ['discovery', 'establishment', id],
    queryFn: () => discoveryApi.getEstablishment(id!),
    enabled: id !== null,
  })
}

export function useCompaniesDiscovery(params: CompanySearchParams) {
  return useQuery({
    queryKey: ['discovery', 'companies', params],
    queryFn: () => discoveryApi.listCompanies(params),
    placeholderData: keepPreviousData,
  })
}
