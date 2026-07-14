import { StatCard } from '@/shared/components/StatCard'
import { RankedListCard } from '@/shared/components/RankedListCard'
import { useAdminReports } from '@/modules/admin/hooks/useAdmin'

export function AdminReportsPage() {
  const { data: report } = useAdminReports()

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Relatórios</h2>
        <p className="text-muted-foreground">Visão global de utilizações do benefício na plataforma.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total de utilizações" value={report?.total_usages} />
        <StatCard label="Utilizações no mês" value={report?.usages_this_month} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RankedListCard title="Empresas com mais utilizações" items={report?.top_companies} />
        <RankedListCard title="Estabelecimentos mais usados" items={report?.top_establishments} />
      </div>
    </section>
  )
}
