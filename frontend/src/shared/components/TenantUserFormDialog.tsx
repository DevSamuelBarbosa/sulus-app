import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TenantRole } from '@/shared/types'
import type { TenantUser } from '@/shared/types/tenant'

interface TenantUserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: TenantUser | null
  /** Admins are trusted to reassign Master directly; self-service uses "Tornar Master" instead. */
  allowMasterInEdit?: boolean
  onCreate: (payload: { name: string; email: string; password: string; tenant_role: 'administrador' | 'normal' }) => Promise<void>
  onUpdate: (payload: { name?: string; email?: string; tenant_role?: TenantRole }) => Promise<void>
}

export function TenantUserFormDialog({
  open,
  onOpenChange,
  user,
  allowMasterInEdit = false,
  onCreate,
  onUpdate,
}: TenantUserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <TenantUserForm
            key={user?.id ?? 'create'}
            user={user}
            allowMasterInEdit={allowMasterInEdit}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function TenantUserForm({
  user,
  allowMasterInEdit,
  onCreate,
  onUpdate,
  onSaved,
}: {
  user?: TenantUser | null
  allowMasterInEdit: boolean
  onCreate: TenantUserFormDialogProps['onCreate']
  onUpdate: TenantUserFormDialogProps['onUpdate']
  onSaved: () => void
}) {
  const isEdit = Boolean(user)
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [tenantRole, setTenantRole] = useState<TenantRole>(user?.tenant_role ?? 'normal')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isEdit) {
        await onUpdate({ name, email, tenant_role: tenantRole })
      } else {
        await onCreate({ name, email, password, tenant_role: tenantRole === 'master' ? 'normal' : tenantRole })
      }
      onSaved()
    } catch {
      setError('Não foi possível salvar. Confira os dados e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Editar login' : 'Novo login'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Atualize os dados deste login.' : 'Cria um novo login vinculado a esta conta.'}
        </DialogDescription>
      </DialogHeader>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tu_name">Nome</Label>
          <Input id="tu_name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tu_email">E-mail</Label>
          <Input
            id="tu_email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {!isEdit && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tu_password">Senha</Label>
            <Input
              id="tu_password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tu_role">Permissão</Label>
          <Select value={tenantRole} onValueChange={(v) => setTenantRole(v as TenantRole)}>
            <SelectTrigger id="tu_role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {isEdit && allowMasterInEdit && <SelectItem value="master">Master</SelectItem>}
              <SelectItem value="administrador">Administrador</SelectItem>
              <SelectItem value="normal">Usuário Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
