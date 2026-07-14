import { useState } from 'react'
import { formatDateTime } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PaginationControls } from '@/shared/components/PaginationControls'
import { useEmployeeUsages } from '@/modules/employees/hooks/useEmployee'

export function EmployeeHistoryPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useEmployeeUsages(page)

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Meu histórico</h2>
        <p className="text-muted-foreground">Utilizações do seu benefício em estabelecimentos parceiros.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estabelecimento</TableHead>
              <TableHead className="text-right">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  Nenhuma utilização registrada ainda.
                </TableCell>
              </TableRow>
            )}
            {data?.data.map((usage) => (
              <TableRow key={usage.id}>
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
