import { useParams } from 'react-router-dom'
import { TenantUsersTable } from '@/shared/components/TenantUsersTable'
import {
  useAdminEstablishment,
  useAdminEstablishmentUsers,
  useCreateAdminEstablishmentUser,
  useDeleteAdminEstablishmentUser,
  useUpdateAdminEstablishmentUser,
} from '@/modules/admin/hooks/useAdmin'

export function AdminEstablishmentUsersPage() {
  const establishmentId = Number(useParams().id)
  const { data: establishment } = useAdminEstablishment(establishmentId)
  const { data: users = [], isLoading } = useAdminEstablishmentUsers(establishmentId)
  const createUser = useCreateAdminEstablishmentUser(establishmentId)
  const updateUser = useUpdateAdminEstablishmentUser(establishmentId)
  const deleteUser = useDeleteAdminEstablishmentUser(establishmentId)

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Usuários</h2>
        <p className="text-muted-foreground">
          Logins vinculados a {establishment?.name || 'este estabelecimento'}.
        </p>
      </div>
      <TenantUsersTable
        users={users}
        isLoading={isLoading}
        allowMasterInEdit
        onCreate={(payload) => createUser.mutateAsync(payload).then(() => {})}
        onUpdate={(userId, payload) => updateUser.mutateAsync({ userId, payload }).then(() => {})}
        onRemove={(userId) => deleteUser.mutateAsync(userId)}
      />
    </section>
  )
}
