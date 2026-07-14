import { useState } from 'react'
import { formatDateTime } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatCard } from '@/shared/components/StatCard'
import { RankedListCard } from '@/shared/components/RankedListCard'
import { PaginationControls } from '@/shared/components/PaginationControls'
import { useCompanyReport, useCompanyUsages } from '@/modules/companies/hooks/useCompany'

export function CompanyHistoryPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data: report } = useCompanyReport()
  const { data, isLoading } = useCompanyUsages({ search: search || undefined, page })

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Histórico</h2>
        <p className="text-muted-foreground">Utilizações do benefício pelos seus funcionários.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total de utilizações" value={report?.total_usages} />
        <StatCard label="Utilizações no mês" value={report?.usages_this_month} />
        <StatCard label="Funcionários ativos" value={report?.active_employees_count} accent />
      </div>

      <RankedListCard title="Estabelecimentos mais usados" items={report?.top_establishments} />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar por funcionário…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-xs"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>Estabelecimento</TableHead>
              <TableHead className="text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Nenhuma utilização encontrada.
                </TableCell>
              </TableRow>
            )}
            {data?.data.map((usage) => (
              <TableRow key={usage.id}>
                <TableCell>{usage.employee_name}</TableCell>
                <TableCell>{usage.establishment_name ?? '—'}</TableCell>
                <TableCell className="text-right">{formatDateTime(usage.used_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PaginationControls meta={data?.meta} page={page} onPageChange={setPage} />
    </section>
  )
}
