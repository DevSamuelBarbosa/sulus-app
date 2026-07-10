import { Building2, LayoutDashboard, QrCode, ScanLine, Settings, Store, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role } from '@/shared/types'

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

export const navItemsByRole: Record<Role, NavItem[]> = {
  admin: [
    { title: 'Visão geral', url: '/admin', icon: LayoutDashboard },
    { title: 'Empresas', url: '/admin/companies', icon: Building2 },
    { title: 'Estabelecimentos', url: '/admin/establishments', icon: Store },
  ],
  company: [
    { title: 'Visão geral', url: '/company', icon: LayoutDashboard },
    { title: 'Funcionários', url: '/company/employees', icon: Users },
    { title: 'Estabelecimentos parceiros', url: '/company/establishments', icon: Store },
    { title: 'Meu perfil', url: '/company/profile', icon: Settings },
  ],
  employee: [
    { title: 'Visão geral', url: '/employee', icon: LayoutDashboard },
    { title: 'Gerar QR Code', url: '/employee/qrcode', icon: QrCode },
    { title: 'Estabelecimentos parceiros', url: '/employee/establishments', icon: Store },
  ],
  establishment: [
    { title: 'Visão geral', url: '/establishment', icon: LayoutDashboard },
    { title: 'Validar QR Code', url: '/establishment/scan', icon: ScanLine },
    { title: 'Empresas parceiras', url: '/establishment/companies', icon: Building2 },
    { title: 'Meu perfil', url: '/establishment/profile', icon: Settings },
  ],
}

export const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  company: 'Empresa',
  employee: 'Funcionário',
  establishment: 'Estabelecimento',
}

/** Exact match for the role's root/overview item; prefix match otherwise. */
export function isNavItemActive(pathname: string, item: NavItem, roleRoot: string): boolean {
  if (item.url === roleRoot) {
    return pathname === roleRoot
  }
  return pathname === item.url || pathname.startsWith(`${item.url}/`)
}
