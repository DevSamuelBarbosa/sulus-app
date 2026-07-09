import { useState } from 'react'
import { Search } from 'lucide-react'
import { useAuth } from '@/modules/auth/AuthContext'
import { useCategories } from '@/modules/categories/hooks/useCategories'
import { EstablishmentCard } from '@/modules/discovery/components/EstablishmentCard'
import { LocationFilter } from '@/modules/discovery/components/LocationFilter'
import { PaginationBar } from '@/modules/discovery/components/PaginationBar'
import { useEstablishmentsDiscovery } from '@/modules/discovery/hooks/useDiscovery'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Partner-establishment directory, shared by the company and employee roles
 * (both browse the same active network — see routes/api/discovery.php).
 */
export function EstablishmentsDiscoveryPage() {
  const { user } = useAuth()
  const { data: categories = [] } = useCategories()

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [stateId, setStateId] = useState<number | null>(null)
  const [cityId, setCityId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useEstablishmentsDiscovery({
    search,
    category_id: categoryId,
    state_id: stateId,
    city_id: cityId,
    page,
  })

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-tertiary">Estabelecimentos parceiros</h2>
        <p className="text-muted-foreground">
          Encontre onde usar o benefício — busque por nome, categoria ou localização.
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

        <Select
          value={categoryId ? String(categoryId) : 'all'}
          onValueChange={(v) => {
            setCategoryId(v === 'all' ? null : Number(v))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
          Nenhum estabelecimento encontrado com esses filtros.
        </p>
      )}

      {data && data.data.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.data.map((establishment) => (
            <EstablishmentCard
              key={establishment.id}
              establishment={establishment}
              to={`/${user?.role}/establishments/${establishment.id}`}
            />
          ))}
        </div>
      )}

      {data && <PaginationBar meta={data.meta} onPageChange={setPage} />}
    </section>
  )
}
