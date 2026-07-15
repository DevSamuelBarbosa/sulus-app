import { useState } from 'react'
import { initials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RowActionsMenu } from '@/shared/components/RowActionsMenu'
import { LocationFilter } from '@/modules/discovery/components/LocationFilter'
import {
  useDeleteEmployee,
  useEmployees,
  useSetBenefitStatus,
} from '@/modules/companies/hooks/useCompany'
import { EmployeeFormDialog } from '@/modules/companies/components/EmployeeFormDialog'
import type { Employee } from '@/modules/companies/types'

export function EmployeesPanel() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [stateId, setStateId] = useState<number | null>(null)
  const [cityId, setCityId] = useState<number | null>(null)
  const { data, isLoading } = useEmployees({ search, status, stateId, cityId })
  const deleteEmployee = useDeleteEmployee()
  const setBenefit = useSetBenefitStatus()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState<Employee | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(employee: Employee) {
    setEditing(employee)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Input
            placeholder="Buscar por nome ou CPF…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <LocationFilter
            stateId={stateId}
            cityId={cityId}
            onChange={(next) => {
              setStateId(next.stateId)
              setCityId(next.cityId)
            }}
          />
        </div>
        <Button onClick={openCreate}>Novo funcionário</Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Benefício</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum funcionário encontrado.
                </TableCell>
              </TableRow>
            )}
            {data?.data.map((employee) => {
              const cancelled = employee.benefit_status === 'cancelled'
              return (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {employee.photo_url && (
                          <AvatarImage src={employee.photo_url} alt={employee.full_name} />
                        )}
                        <AvatarFallback>{initials(employee.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.full_name}</div>
                        <div className="text-xs text-muted-foreground">{employee.login_email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.cpf}</TableCell>
                  <TableCell>{employee.city ? `${employee.city.name}/${employee.city.uf}` : '—'}</TableCell>
                  <TableCell>
                    <Badge variant={cancelled ? 'outline' : 'secondary'}>
                      {employee.benefit_status_label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActionsMenu
                      actions={[
                        {
                          label: cancelled ? 'Reativar' : 'Cancelar',
                          disabled: setBenefit.isPending,
                          onClick: () =>
                            void setBenefit.mutateAsync({ id: employee.id, cancel: !cancelled }),
                        },
                        { label: 'Editar', onClick: () => openEdit(employee) },
                        { label: 'Excluir', variant: 'destructive', onClick: () => setDeleting(employee) },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <EmployeeFormDialog open={formOpen} onOpenChange={setFormOpen} employee={editing} />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir funcionário?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.full_name} deixará de acessar o benefício. O histórico de utilizações é
              preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) void deleteEmployee.mutateAsync(deleting.id)
                setDeleting(null)
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
