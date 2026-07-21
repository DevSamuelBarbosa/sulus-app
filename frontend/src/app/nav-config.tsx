import {
  Building2,
  History,
  LayoutDashboard,
  QrCode,
  ScanLine,
  Settings,
  Store,
  Tags,
  Users,
  UserCog,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role, TenantRole } from '@/shared/types'

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  /** Only shown when the current login's tenant_role is one of these (company/establishment only). */
  restrictedTo?: TenantRole[]
}

export const navItemsByRole: Record<Role, NavItem[]> = {
  admin: [
    { title: 'Visão geral', url: '/admin', icon: LayoutDashboard },
    { title: 'Empresas', url: '/admin/companies', icon: Building2 },
    { title: 'Estabelecimentos', url: '/admin/establishments', icon: Store },
    { title: 'Categorias', url: '/admin/categories', icon: Tags },
    { title: 'Relatórios', url: '/admin/reports', icon: History },
  ],
  company: [
    { title: 'Visão geral', url: '/company', icon: LayoutDashboard },
    { title: 'Funcionários', url: '/company/employees', icon: Users },
    { title: 'Estabelecimentos parceiros', url: '/company/establishments', icon: Store },
    { title: 'Histórico', url: '/company/usages', icon: History },
    { title: 'Meu perfil', url: '/company/profile', icon: Settings },
    {
      title: 'Usuários',
      url: '/company/users',
      icon: UserCog,
      restrictedTo: ['master', 'administrador'],
    },
  ],
  employee: [
    { title: 'Visão geral', url: '/employee', icon: LayoutDashboard },
    { title: 'Gerar QR Code', url: '/employee/qrcode', icon: QrCode },
    { title: 'Estabelecimentos parceiros', url: '/employee/establishments', icon: Store },
    { title: 'Meu histórico', url: '/employee/usages', icon: History },
  ],
  establishment: [
    { title: 'Visão geral', url: '/establishment', icon: LayoutDashboard },
    { title: 'Validar QR Code', url: '/establishment/scan', icon: ScanLine },
    { title: 'Empresas parceiras', url: '/establishment/companies', icon: Building2 },
    { title: 'Histórico', url: '/establishment/usages', icon: History },
    { title: 'Meu perfil', url: '/establishment/profile', icon: Settings },
    {
      title: 'Usuários',
      url: '/establishment/users',
      icon: UserCog,
      restrictedTo: ['master', 'administrador'],
    },
  ],
}

export const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  company: 'Empresa',
  employee: 'Funcionário',
  establishment: 'Estabelecimento',
}

/** Drops items restricted to tenant_roles the current login doesn't have. */
export function filterNavItemsByPermission(items: NavItem[], tenantRole: TenantRole | null): NavItem[] {
  return items.filter((item) => !item.restrictedTo || (tenantRole && item.restrictedTo.includes(tenantRole)))
}

/** Exact match for the role's root/overview item; prefix match otherwise. */
export function isNavItemActive(pathname: string, item: NavItem, roleRoot: string): boolean {
  if (item.url === roleRoot) {
    return pathname === roleRoot
  }
  return pathname === item.url || pathname.startsWith(`${item.url}/`)
}
