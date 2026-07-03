import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminStats } from '@/modules/admin/hooks/useAdmin'
import { CompaniesPanel } from '@/modules/admin/components/CompaniesPanel'
import { EstablishmentsPanel } from '@/modules/admin/components/EstablishmentsPanel'

function StatCard({ label, value }: { label: string; value: number | undefined }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-tertiary">{value ?? '—'}</p>
      </CardContent>
    </Card>
  )
}

export function AdminDashboard() {
  const { data: stats } = useAdminStats()

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-tertiary">Painel do Administrador</h2>
        <p className="text-muted-foreground">Gestão global de empresas e estabelecimentos.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Empresas ativas" value={stats?.companies_active_count} />
        <StatCard label="Estabelecimentos ativos" value={stats?.establishments_active_count} />
        <StatCard label="Funcionários" value={stats?.employees_count} />
      </div>

      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="establishments">Estabelecimentos</TabsTrigger>
        </TabsList>
        <TabsContent value="companies">
          <CompaniesPanel />
        </TabsContent>
        <TabsContent value="establishments">
          <EstablishmentsPanel />
        </TabsContent>
      </Tabs>
    </section>
  )
}
