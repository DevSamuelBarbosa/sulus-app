import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { establishmentApi } from '@/modules/establishments/api/establishment.api'
import type { CreateTenantUserPayload, UpdateTenantUserPayload } from '@/shared/types/tenant'
import type {
  UpdateEstablishmentProfilePayload,
  UpdateEstablishmentSettingsPayload,
  UsageFilters,
} from '@/modules/establishments/types'

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

export function useUpdateEstablishmentSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateEstablishmentSettingsPayload) =>
      establishmentApi.profile.updateSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['establishment', 'profile'] })
    },
  })
}

export function useDeleteEstablishmentAccount() {
  return useMutation({
    mutationFn: (password: string) => establishmentApi.profile.deleteAccount(password),
  })
}

export function useEstablishmentUsers() {
  return useQuery({
    queryKey: ['establishment', 'users'],
    queryFn: () => establishmentApi.users.list(),
  })
}

export function useCreateEstablishmentUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTenantUserPayload) => establishmentApi.users.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['establishment', 'users'] })
    },
  })
}

export function useUpdateEstablishmentUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdateTenantUserPayload }) =>
      establishmentApi.users.update(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['establishment', 'users'] })
    },
  })
}

export function useDeleteEstablishmentUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => establishmentApi.users.remove(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['establishment', 'users'] })
    },
  })
}

export function usePromoteEstablishmentMaster() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, password }: { userId: number; password: string }) =>
      establishmentApi.users.promoteMaster(userId, password),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['establishment', 'users'] })
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
