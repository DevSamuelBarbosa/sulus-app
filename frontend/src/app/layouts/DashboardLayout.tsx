import { Outlet } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  company: 'Empresa',
  employee: 'Funcionário',
  establishment: 'Estabelecimento',
}

export function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <span className="brand">Sulus</span>
        <div className="dashboard-user">
          {user && (
            <span>
              {user.name} · <strong>{roleLabels[user.role]}</strong>
            </span>
          )}
          <button type="button" onClick={() => void logout()}>
            Sair
          </button>
        </div>
      </header>
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  )
}
