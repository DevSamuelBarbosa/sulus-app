import { useState } from 'react'
import { useAuth } from '@/modules/auth/AuthContext'
import { TenantUsersTable } from '@/shared/components/TenantUsersTable'
import { MasterPasswordDialog } from '@/shared/components/MasterPasswordDialog'
import {
  useCreateEstablishmentUser,
  useDeleteEstablishmentUser,
  useEstablishmentUsers,
  usePromoteEstablishmentMaster,
  useUpdateEstablishmentUser,
} from '@/modules/establishments/hooks/useEstablishment'
import type { TenantUser, UpdateTenantUserPayload } from '@/shared/types/tenant'

export function EstablishmentUsersPage() {
  const { user, refreshUser } = useAuth()
  const { data: users = [], isLoading } = useEstablishmentUsers()
  const createUser = useCreateEstablishmentUser()
  const updateUser = useUpdateEstablishmentUser()
  const deleteUser = useDeleteEstablishmentUser()
  const promoteMaster = usePromoteEstablishmentMaster()
  const [promoting, setPromoting] = useState<TenantUser | null>(null)

  if (user?.tenant_role === 'normal') {
    return <p className="text-muted-foreground">Você não tem permissão para gerenciar logins.</p>
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Usuários</h2>
        <p className="text-muted-foreground">Logins vinculados ao seu estabelecimento.</p>
      </div>
      <TenantUsersTable
        users={users}
        isLoading={isLoading}
        onPromote={user?.tenant_role === 'master' ? setPromoting : undefined}
        onCreate={(payload) => createUser.mutateAsync(payload).then(() => {})}
        onUpdate={(userId, payload) =>
          updateUser.mutateAsync({ userId, payload: payload as UpdateTenantUserPayload }).then(() => {})
        }
        onRemove={(userId) => deleteUser.mutateAsync(userId)}
      />

      <MasterPasswordDialog
        open={promoting !== null}
        onOpenChange={(open) => !open && setPromoting(null)}
        title={`Tornar ${promoting?.name ?? ''} Master?`}
        description="Você deixará de ser Master e passará a Administrador. Essa ação não pode ser desfeita sem que o novo Master te promova de volta."
        confirmLabel="Tornar Master"
        onConfirm={async (password) => {
          if (!promoting) return
          await promoteMaster.mutateAsync({ userId: promoting.id, password })
          await refreshUser()
        }}
      />
    </section>
  )
}
