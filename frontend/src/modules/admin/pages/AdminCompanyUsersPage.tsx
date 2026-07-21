import { useParams } from 'react-router-dom'
import { TenantUsersTable } from '@/shared/components/TenantUsersTable'
import {
  useAdminCompany,
  useAdminCompanyUsers,
  useCreateAdminCompanyUser,
  useDeleteAdminCompanyUser,
  useUpdateAdminCompanyUser,
} from '@/modules/admin/hooks/useAdmin'

export function AdminCompanyUsersPage() {
  const companyId = Number(useParams().id)
  const { data: company } = useAdminCompany(companyId)
  const { data: users = [], isLoading } = useAdminCompanyUsers(companyId)
  const createUser = useCreateAdminCompanyUser(companyId)
  const updateUser = useUpdateAdminCompanyUser(companyId)
  const deleteUser = useDeleteAdminCompanyUser(companyId)

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Usuários</h2>
        <p className="text-muted-foreground">
          Logins vinculados a {company?.trade_name || company?.legal_name || 'esta empresa'}.
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
