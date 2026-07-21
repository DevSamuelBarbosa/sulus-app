import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/modules/admin/api/admin.api'
import type {
  AdminListFilters,
  AdminUpdateTenantUserPayload,
  CreateCompanyPayload,
  CreateEstablishmentPayload,
  CreateTenantUserPayload,
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

export function useAdminCompanies(filters: AdminListFilters) {
  return useQuery({
    queryKey: ['admin', 'companies', filters],
    queryFn: () => adminApi.companies.list(filters),
  })
}

export function useAdminCompany(id: number) {
  return useQuery({
    queryKey: ['admin', 'companies', id],
    queryFn: () => adminApi.companies.get(id),
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

export function useAdminEstablishments(filters: AdminListFilters) {
  return useQuery({
    queryKey: ['admin', 'establishments', filters],
    queryFn: () => adminApi.establishments.list(filters),
  })
}

export function useAdminEstablishment(id: number) {
  return useQuery({
    queryKey: ['admin', 'establishments', id],
    queryFn: () => adminApi.establishments.get(id),
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

export function useAdminCompanyUsers(companyId: number) {
  return useQuery({
    queryKey: ['admin', 'companies', companyId, 'users'],
    queryFn: () => adminApi.companies.users.list(companyId),
  })
}

export function useCreateAdminCompanyUser(companyId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTenantUserPayload) => adminApi.companies.users.create(companyId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'companies', companyId, 'users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] })
    },
  })
}

export function useUpdateAdminCompanyUser(companyId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: AdminUpdateTenantUserPayload }) =>
      adminApi.companies.users.update(companyId, userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'companies', companyId, 'users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] })
    },
  })
}

export function useDeleteAdminCompanyUser(companyId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => adminApi.companies.users.remove(companyId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'companies', companyId, 'users'] })
    },
  })
}

export function useAdminEstablishmentUsers(establishmentId: number) {
  return useQuery({
    queryKey: ['admin', 'establishments', establishmentId, 'users'],
    queryFn: () => adminApi.establishments.users.list(establishmentId),
  })
}

export function useCreateAdminEstablishmentUser(establishmentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTenantUserPayload) =>
      adminApi.establishments.users.create(establishmentId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'establishments', establishmentId, 'users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'establishments'] })
    },
  })
}

export function useUpdateAdminEstablishmentUser(establishmentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: AdminUpdateTenantUserPayload }) =>
      adminApi.establishments.users.update(establishmentId, userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'establishments', establishmentId, 'users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'establishments'] })
    },
  })
}

export function useDeleteAdminEstablishmentUser(establishmentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => adminApi.establishments.users.remove(establishmentId, userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'establishments', establishmentId, 'users'] })
    },
  })
}
