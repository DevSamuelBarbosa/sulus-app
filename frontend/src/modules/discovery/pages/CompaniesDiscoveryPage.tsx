import { useState } from 'react'
import { Search } from 'lucide-react'
import { CompanyCard } from '@/modules/discovery/components/CompanyCard'
import { LocationFilter } from '@/modules/discovery/components/LocationFilter'
import { PaginationBar } from '@/modules/discovery/components/PaginationBar'
import { useCompaniesDiscovery } from '@/modules/discovery/hooks/useDiscovery'
import { Input } from '@/components/ui/input'

/** Partner-company directory for the establishment role. */
export function CompaniesDiscoveryPage() {
  const [search, setSearch] = useState('')
  const [stateId, setStateId] = useState<number | null>(null)
  const [cityId, setCityId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useCompaniesDiscovery({
    search,
    state_id: stateId,
    city_id: cityId,
    page,
  })

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Empresas parceiras</h2>
        <p className="text-muted-foreground">
          Empresas cujos clientes podem usar o benefício aqui.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-8"
          />
        </div>

        <LocationFilter
          stateId={stateId}
          cityId={cityId}
          onChange={(v) => {
            setStateId(v.stateId)
            setCityId(v.cityId)
            setPage(1)
          }}
        />
      </div>

      {isLoading && !data && (
        <p className="text-center text-sm text-muted-foreground">Carregando…</p>
      )}

      {data && data.data.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Nenhuma empresa encontrada com esses filtros.
        </p>
      )}

      {data && data.data.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.data.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}

      {data && <PaginationBar meta={data.meta} onPageChange={setPage} />}
    </section>
  )
}
