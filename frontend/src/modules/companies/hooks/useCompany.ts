import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { companyApi } from '@/modules/companies/api/company.api'
import type { CreateTenantUserPayload, UpdateTenantUserPayload } from '@/shared/types/tenant'
import type {
  CreateEmployeePayload,
  EmployeeFilters,
  UpdateCompanyProfilePayload,
  UpdateCompanySettingsPayload,
  UpdateEmployeePayload,
  UsageFilters,
} from '@/modules/companies/types'

export function useCompanyProfile() {
  return useQuery({
    queryKey: ['company', 'profile'],
    queryFn: () => companyApi.profile.get(),
  })
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateCompanyProfilePayload) => companyApi.profile.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['company', 'profile'] })
    },
  })
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateCompanySettingsPayload) => companyApi.profile.updateSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['company', 'profile'] })
    },
  })
}

export function useDeleteCompanyAccount() {
  return useMutation({
    mutationFn: (password: string) => companyApi.profile.deleteAccount(password),
  })
}

export function useCompanyUsers() {
  return useQuery({
    queryKey: ['company', 'users'],
    queryFn: () => companyApi.users.list(),
  })
}

export function useCreateCompanyUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTenantUserPayload) => companyApi.users.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['company', 'users'] })
    },
  })
}

export function useUpdateCompanyUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: UpdateTenantUserPayload }) =>
      companyApi.users.update(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['company', 'users'] })
    },
  })
}

export function useDeleteCompanyUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => companyApi.users.remove(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['company', 'users'] })
    },
  })
}

export function usePromoteCompanyMaster() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, password }: { userId: number; password: string }) =>
      companyApi.users.promoteMaster(userId, password),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['company', 'users'] })
    },
  })
}

export function useEmployees(filters: EmployeeFilters) {
  return useQuery({
    queryKey: ['company', 'employees', filters],
    queryFn: () => companyApi.employees.list(filters),
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => companyApi.employees.create(payload),
    onSuccess: () => invalidateEmployees(queryClient),
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateEmployeePayload }) =>
      companyApi.employees.update(id, payload),
    onSuccess: () => invalidateEmployees(queryClient),
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => companyApi.employees.remove(id),
    onSuccess: () => invalidateEmployees(queryClient),
  })
}

export function useSetBenefitStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, cancel }: { id: number; cancel: boolean }) =>
      cancel ? companyApi.employees.cancelBenefit(id) : companyApi.employees.reactivateBenefit(id),
    onSuccess: () => invalidateEmployees(queryClient),
  })
}

export function useRestoreEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => companyApi.employees.restore(id),
    onSuccess: () => invalidateEmployees(queryClient),
  })
}

export function useUploadEmployeePhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      companyApi.employees.uploadPhoto(id, file),
    onSuccess: () => invalidateEmployees(queryClient),
  })
}

function invalidateEmployees(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({ queryKey: ['company', 'employees'] })
}

export function useCompanyUsages(filters: UsageFilters) {
  return useQuery({
    queryKey: ['company', 'usages', filters],
    queryFn: () => companyApi.usages.list(filters),
  })
}

export function useCompanyReport() {
  return useQuery({
    queryKey: ['company', 'reports'],
    queryFn: () => companyApi.reports.get(),
  })
}
