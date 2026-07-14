import { useQuery } from '@tanstack/react-query'
import { employeeApi } from '@/modules/employees/api/employee.api'

export function useEmployeeUsages(page: number) {
  return useQuery({
    queryKey: ['employee', 'usages', page],
    queryFn: () => employeeApi.usages.list(page),
  })
}
