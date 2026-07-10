import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { isNavItemActive, navItemsByRole } from '@/app/nav-config'
import { AppSidebar } from '@/app/layouts/AppSidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

function usePageTitle(): string {
  const { user } = useAuth()
  const { pathname } = useLocation()

  if (!user) {
    return ''
  }

  const roleRoot = `/${user.role}`
  const current = navItemsByRole[user.role].find((item) => isNavItemActive(pathname, item, roleRoot))
  return current?.title ?? 'Visão geral'
}

export function DashboardLayout() {
  const title = usePageTitle()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <h1 className="text-sm font-medium">{title}</h1>
        </header>
        <div className="flex-1 p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
