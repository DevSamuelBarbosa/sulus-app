import { Link } from 'react-router-dom'
import { Building2, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminStats } from '@/modules/admin/hooks/useAdmin'

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number | undefined
  /** Marks counts that represent something currently active/healthy. */
  accent?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          {accent && <span className="size-1.5 shrink-0 rounded-full bg-secondary" aria-hidden />}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-foreground">{value ?? '—'}</p>
      </CardContent>
    </Card>
  )
}

export function AdminDashboard() {
  const { data: stats } = useAdminStats()

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Painel do Administrador</h2>
        <p className="text-muted-foreground">Gestão global de empresas e estabelecimentos.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Empresas ativas" value={stats?.companies_active_count} accent />
        <StatCard label="Estabelecimentos ativos" value={stats?.establishments_active_count} accent />
        <StatCard label="Funcionários" value={stats?.employees_count} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>Cadastre, edite e ative/desative empresas parceiras.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/companies">
                <Building2 className="size-4" />
                Gerenciar empresas
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estabelecimentos</CardTitle>
            <CardDescription>Cadastre, edite e ative/desative estabelecimentos parceiros.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/establishments">
                <Store className="size-4" />
                Gerenciar estabelecimentos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
