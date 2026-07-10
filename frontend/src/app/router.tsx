import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute'
import { RoleRoute } from '@/modules/auth/components/RoleRoute'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { AccountInactivePage } from '@/modules/auth/pages/AccountInactivePage'
import { AdminDashboard } from '@/modules/admin/pages/AdminDashboard'
import { AdminCompaniesPage } from '@/modules/admin/pages/AdminCompaniesPage'
import { AdminEstablishmentsPage } from '@/modules/admin/pages/AdminEstablishmentsPage'
import { CompanyDashboard } from '@/modules/companies/pages/CompanyDashboard'
import { CompanyEmployeesPage } from '@/modules/companies/pages/CompanyEmployeesPage'
import { CompanyProfilePage } from '@/modules/companies/pages/CompanyProfilePage'
import { EmployeeDashboard } from '@/modules/employees/pages/EmployeeDashboard'
import { EstablishmentDashboard } from '@/modules/establishments/pages/EstablishmentDashboard'
import { EstablishmentSettingsPage } from '@/modules/establishments/pages/EstablishmentSettingsPage'
import { EmployeeQrScreen } from '@/modules/qrcode/pages/EmployeeQrScreen'
import { ScanQrPage } from '@/modules/benefits/pages/ScanQrPage'
import { CompaniesDiscoveryPage } from '@/modules/discovery/pages/CompaniesDiscoveryPage'
import { EstablishmentProfilePage } from '@/modules/discovery/pages/EstablishmentProfilePage'
import { EstablishmentsDiscoveryPage } from '@/modules/discovery/pages/EstablishmentsDiscoveryPage'

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
        <Route path="/conta-desativada" element={<AccountInactivePage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomeRedirect />} />

          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/companies" element={<AdminCompaniesPage />} />
            <Route path="/admin/establishments" element={<AdminEstablishmentsPage />} />
          </Route>
          <Route element={<RoleRoute allow={['company']} />}>
            <Route path="/company" element={<CompanyDashboard />} />
            <Route path="/company/employees" element={<CompanyEmployeesPage />} />
            <Route path="/company/establishments" element={<EstablishmentsDiscoveryPage />} />
            <Route path="/company/establishments/:id" element={<EstablishmentProfilePage />} />
            <Route path="/company/profile" element={<CompanyProfilePage />} />
          </Route>
          <Route element={<RoleRoute allow={['employee']} />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/establishments" element={<EstablishmentsDiscoveryPage />} />
            <Route path="/employee/establishments/:id" element={<EstablishmentProfilePage />} />
          </Route>
          <Route element={<RoleRoute allow={['establishment']} />}>
            <Route path="/establishment" element={<EstablishmentDashboard />} />
            <Route path="/establishment/scan" element={<ScanQrPage />} />
            <Route path="/establishment/companies" element={<CompaniesDiscoveryPage />} />
            <Route path="/establishment/profile" element={<EstablishmentSettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/*
        Deliberately outside DashboardLayout: the employee mostly opens this
        on a phone at a partner's counter, so it gets its own full-bleed
        chrome instead of the sidebar-less top bar used elsewhere.
      */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={['employee']} />}>
          <Route path="/employee/qrcode" element={<EmployeeQrScreen />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
