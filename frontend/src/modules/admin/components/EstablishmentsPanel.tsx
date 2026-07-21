import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import {
  useAdminEstablishments,
  useDeleteEstablishment,
  useUpdateEstablishment,
} from '@/modules/admin/hooks/useAdmin'
import { EstablishmentFormDialog } from '@/modules/admin/components/EstablishmentFormDialog'
import type { AdminEstablishment } from '@/modules/admin/types'

export function EstablishmentsPanel() {
  const [search, setSearch] = useState('')
  const [stateId, setStateId] = useState<number | null>(null)
  const [cityId, setCityId] = useState<number | null>(null)
  const { data, isLoading } = useAdminEstablishments({ search, stateId, cityId })
  const deleteEstablishment = useDeleteEstablishment()
  const updateEstablishment = useUpdateEstablishment()
  const { impersonate } = useAuth()
  const navigate = useNavigate()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminEstablishment | null>(null)
  const [deleting, setDeleting] = useState<AdminEstablishment | null>(null)

  async function handleImpersonate(establishment: AdminEstablishment) {
    if (!establishment.master) return
    await impersonate(establishment.master.id)
    navigate('/establishment')
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(establishment: AdminEstablishment) {
    setEditing(establishment)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Input
            placeholder="Buscar por nome ou CNPJ…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <LocationFilter
            stateId={stateId}
            cityId={cityId}
            onChange={(next) => {
              setStateId(next.stateId)
              setCityId(next.cityId)
            }}
          />
        </div>
        <Button onClick={openCreate}>Novo estabelecimento</Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estabelecimento</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum estabelecimento encontrado.
                </TableCell>
              </TableRow>
            )}
            {data?.data.map((establishment) => (
              <TableRow key={establishment.id}>
                <TableCell>
                  <div className="font-medium">{establishment.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {establishment.master?.email ?? 'Sem login'}
                  </div>
                </TableCell>
                <TableCell>{establishment.cnpj}</TableCell>
                <TableCell>{establishment.category?.name ?? '—'}</TableCell>
                <TableCell>
                  {establishment.city ? `${establishment.city.name}/${establishment.city.uf}` : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={establishment.is_active ? 'secondary' : 'outline'}>
                    {establishment.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <RowActionsMenu
                    actions={[
                      {
                        label: establishment.is_active ? 'Desativar' : 'Ativar',
                        disabled: updateEstablishment.isPending,
                        onClick: () =>
                          void updateEstablishment.mutateAsync({
                            id: establishment.id,
                            payload: { is_active: !establishment.is_active },
                          }),
                      },
                      { label: 'Editar', onClick: () => openEdit(establishment) },
                      {
                        label: 'Usuários',
                        onClick: () => navigate(`/admin/establishments/${establishment.id}/users`),
                      },
                      {
                        label: 'Impersonar',
                        disabled: !establishment.master,
                        onClick: () => void handleImpersonate(establishment),
                      },
                      {
                        label: 'Excluir',
                        variant: 'destructive',
                        onClick: () => setDeleting(establishment),
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EstablishmentFormDialog open={formOpen} onOpenChange={setFormOpen} establishment={editing} />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir estabelecimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso remove {deleting?.name} da listagem. A ação pode ser revertida apenas via suporte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) void deleteEstablishment.mutateAsync(deleting.id)
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
