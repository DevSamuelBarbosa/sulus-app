import { useState } from 'react'
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
import {
  useAdminEstablishments,
  useDeleteEstablishment,
  useUpdateEstablishment,
} from '@/modules/admin/hooks/useAdmin'
import { EstablishmentFormDialog } from '@/modules/admin/components/EstablishmentFormDialog'
import type { AdminEstablishment } from '@/modules/admin/types'

export function EstablishmentsPanel() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAdminEstablishments(search)
  const deleteEstablishment = useDeleteEstablishment()
  const updateEstablishment = useUpdateEstablishment()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminEstablishment | null>(null)
  const [deleting, setDeleting] = useState<AdminEstablishment | null>(null)

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
        <Input
          placeholder="Buscar por nome ou CNPJ…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
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
                  <div className="text-xs text-muted-foreground">{establishment.login_email}</div>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={updateEstablishment.isPending}
                    onClick={() =>
                      void updateEstablishment.mutateAsync({
                        id: establishment.id,
                        payload: { is_active: !establishment.is_active },
                      })
                    }
                  >
                    {establishment.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(establishment)}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(establishment)}>
                    Excluir
                  </Button>
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
