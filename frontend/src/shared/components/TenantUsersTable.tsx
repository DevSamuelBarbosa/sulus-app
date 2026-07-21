import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { TenantUserFormDialog } from '@/shared/components/TenantUserFormDialog'
import type { TenantRole } from '@/shared/types'
import type { TenantUser } from '@/shared/types/tenant'

const roleLabels: Record<TenantRole, string> = {
  master: 'Master',
  administrador: 'Administrador',
  normal: 'Usuário Normal',
}

interface TenantUsersTableProps {
  users: TenantUser[]
  isLoading: boolean
  /** Admins are trusted to reassign Master directly from the edit form. */
  allowMasterInEdit?: boolean
  /** Only the tenant's own Master sees "Tornar Master" on other logins. */
  onPromote?: (user: TenantUser) => void
  onCreate: (payload: { name: string; email: string; password: string; tenant_role: 'administrador' | 'normal' }) => Promise<void>
  onUpdate: (userId: number, payload: { name?: string; email?: string; tenant_role?: TenantRole }) => Promise<void>
  onRemove: (userId: number) => Promise<void>
}

export function TenantUsersTable({
  users,
  isLoading,
  allowMasterInEdit = false,
  onPromote,
  onCreate,
  onUpdate,
  onRemove,
}: TenantUsersTableProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TenantUser | null>(null)
  const [deleting, setDeleting] = useState<TenantUser | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(user: TenantUser) {
    setEditing(user)
    setFormOpen(true)
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteError(null)
    try {
      await onRemove(deleting.id)
      setDeleting(null)
    } catch {
      setDeleteError('Não foi possível remover este login.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>Novo login</Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Permissão</TableHead>
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
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum login cadastrado.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.tenant_role === 'master' ? 'default' : 'secondary'}>
                    {roleLabels[user.tenant_role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'secondary' : 'outline'}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <RowActionsMenu
                    actions={[
                      { label: 'Editar', onClick: () => openEdit(user) },
                      ...(onPromote && user.tenant_role !== 'master'
                        ? [{ label: 'Tornar Master', onClick: () => onPromote(user) }]
                        : []),
                      {
                        label: 'Remover',
                        variant: 'destructive' as const,
                        disabled: user.tenant_role === 'master',
                        onClick: () => {
                          setDeleteError(null)
                          setDeleting(user)
                        },
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TenantUserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        allowMasterInEdit={allowMasterInEdit}
        onCreate={onCreate}
        onUpdate={(payload) => onUpdate(editing!.id, payload)}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover login?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.name}" ({deleting?.email}) não poderá mais acessar a conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <Alert variant="destructive">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); void handleDelete() }}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
