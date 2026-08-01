import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { formatCnpj } from '@/shared/lib/masks'
import { initials } from '@/lib/utils'
import { useAdminCompanies, useDeleteCompany, useUpdateCompany } from '@/modules/admin/hooks/useAdmin'
import { CompanyFormDialog } from '@/modules/admin/components/CompanyFormDialog'
import type { AdminCompany } from '@/modules/admin/types'

export function CompaniesPanel() {
  const [search, setSearch] = useState('')
  const [stateId, setStateId] = useState<number | null>(null)
  const [cityId, setCityId] = useState<number | null>(null)
  const { data, isLoading } = useAdminCompanies({ search, stateId, cityId })
  const deleteCompany = useDeleteCompany()
  const updateCompany = useUpdateCompany()
  const { impersonate } = useAuth()
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<AdminCompany | null>(null)
  const editing = editingId ? (data?.data.find((c) => c.id === editingId) ?? null) : null

  async function handleImpersonate(company: AdminCompany) {
    if (!company.master) return
    await impersonate(company.master.id)
    navigate('/company')
  }

  function openCreate() {
    setEditingId(null)
    setFormOpen(true)
  }

  function openEdit(company: AdminCompany) {
    setEditingId(company.id)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-end gap-2 sm:shrink-0">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="companies-search">Buscar</Label>
            <Input
              id="companies-search"
              placeholder="Nome ou CNPJ…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
          <LocationFilter
            stateId={stateId}
            cityId={cityId}
            onChange={(next) => {
              setStateId(next.stateId)
              setCityId(next.cityId)
            }}
            showLabels
          />
        </div>
        <Button onClick={openCreate}>Nova empresa</Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Status</TableHead>
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
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            )}
            {data?.data.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {company.logo_url && (
                        <AvatarImage src={company.logo_url} alt={company.trade_name || company.legal_name} />
                      )}
                      <AvatarFallback>{initials(company.trade_name || company.legal_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{company.trade_name || company.legal_name}</div>
                      <div className="text-xs text-muted-foreground">{company.master?.email ?? 'Sem login'}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatCnpj(company.cnpj)}</TableCell>
                <TableCell>{company.city ? `${company.city.name}/${company.city.uf}` : '—'}</TableCell>
                <TableCell>
                  <Badge variant={company.is_active ? 'secondary' : 'outline'}>
                    {company.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <RowActionsMenu
                    actions={[
                      {
                        label: company.is_active ? 'Desativar' : 'Ativar',
                        disabled: updateCompany.isPending,
                        onClick: () =>
                          void updateCompany.mutateAsync({
                            id: company.id,
                            payload: { is_active: !company.is_active },
                          }),
                      },
                      { label: 'Editar', onClick: () => openEdit(company) },
                      { label: 'Usuários', onClick: () => navigate(`/admin/companies/${company.id}/users`) },
                      {
                        label: 'Impersonar',
                        disabled: !company.master,
                        onClick: () => void handleImpersonate(company),
                      },
                      { label: 'Excluir', variant: 'destructive', onClick: () => setDeleting(company) },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CompanyFormDialog open={formOpen} onOpenChange={setFormOpen} company={editing} />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove {deleting?.trade_name || deleting?.legal_name} da listagem. A ação pode ser
              revertida apenas via suporte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) void deleteCompany.mutateAsync(deleting.id)
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
