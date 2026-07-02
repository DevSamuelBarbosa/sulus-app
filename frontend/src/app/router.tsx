import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute'
import { RoleRoute } from '@/modules/auth/components/RoleRoute'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { AdminDashboard } from '@/modules/admin/pages/AdminDashboard'
import { CompanyDashboard } from '@/modules/companies/pages/CompanyDashboard'
import { EmployeeDashboard } from '@/modules/employees/pages/EmployeeDashboard'
import { EstablishmentDashboard } from '@/modules/establishments/pages/EstablishmentDashboard'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <Navigate to={`/${user.role}`} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomeRedirect />} />

          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route element={<RoleRoute allow={['company']} />}>
            <Route path="/company" element={<CompanyDashboard />} />
          </Route>
          <Route element={<RoleRoute allow={['employee']} />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
          </Route>
          <Route element={<RoleRoute allow={['establishment']} />}>
            <Route path="/establishment" element={<EstablishmentDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
