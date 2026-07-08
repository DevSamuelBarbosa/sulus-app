import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { companyApi } from '@/modules/companies/api/company.api'
import type {
  CreateEmployeePayload,
  UpdateCompanyProfilePayload,
  UpdateEmployeePayload,
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

export function useEmployees(search: string, status: string) {
  return useQuery({
    queryKey: ['company', 'employees', search, status],
    queryFn: () => companyApi.employees.list(search, status),
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
