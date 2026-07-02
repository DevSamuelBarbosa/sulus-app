import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1 className="brand">Sulus Benefícios</h1>
        <Outlet />
      </div>
    </div>
  )
}
