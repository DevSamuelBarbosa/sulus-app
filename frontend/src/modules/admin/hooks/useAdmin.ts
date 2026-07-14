import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/modules/admin/api/admin.api'
import type {
  CreateCompanyPayload,
  CreateEstablishmentPayload,
  UpdateCompanyPayload,
  UpdateEstablishmentPayload,
} from '@/modules/admin/types'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
  })
}

export function useAdminReports() {
  return useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => adminApi.getReports(),
  })
}

export function useAdminCompanies(search: string) {
  return useQuery({
    queryKey: ['admin', 'companies', search],
    queryFn: () => adminApi.companies.list(search),
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => adminApi.companies.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCompanyPayload }) =>
      adminApi.companies.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.companies.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useAdminEstablishments(search: string) {
  return useQuery({
    queryKey: ['admin', 'establishments', search],
    queryFn: () => adminApi.establishments.list(search),
  })
}

export function useCreateEstablishment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEstablishmentPayload) => adminApi.establishments.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'establishments'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useUpdateEstablishment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEstablishmentPayload }) =>
      adminApi.establishments.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'establishments'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useDeleteEstablishment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminApi.establishments.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'establishments'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}
