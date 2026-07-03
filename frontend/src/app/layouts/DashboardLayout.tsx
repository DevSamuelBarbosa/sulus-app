import { Outlet } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  company: 'Empresa',
  employee: 'Funcionário',
  establishment: 'Estabelecimento',
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-svh bg-muted">
      <header className="flex items-center justify-between bg-tertiary px-6 py-3 text-tertiary-foreground">
        <span className="text-lg font-semibold">
          <span className="text-primary">Sulus</span> Benefícios
        </span>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">{user.name}</p>
                <Badge variant="secondary" className="mt-0.5">
                  {roleLabels[user.role]}
                </Badge>
              </div>
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user.name}
                <p className="font-normal text-muted-foreground">{roleLabels[user.role]}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => void logout()}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
