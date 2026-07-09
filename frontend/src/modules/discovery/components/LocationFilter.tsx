import { useMemo, useState } from 'react'
import { useCities, useCity, useStates } from '@/modules/localization/hooks/useLocalization'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LocationFilterProps {
  stateId: number | null
  cityId: number | null
  onChange: (value: { stateId: number | null; cityId: number | null }) => void
}

/**
 * State→city filter pair for discovery search. Lighter than AddressForm (no
 * CEP lookup, no address fields) but keeps the same typed city filter —
 * `/cities` caps results at 50, alphabetically, so without a search term a
 * state with more cities than that (e.g. RS) would only ever show up to
 * roughly the letter B.
 */
export function LocationFilter({ stateId, cityId, onChange }: LocationFilterProps) {
  const { data: states = [] } = useStates()
  const [citySearch, setCitySearch] = useState('')
  const { data: cities = [] } = useCities(stateId, citySearch)
  // The selected city may fall outside the current search page, so it's
  // resolved directly and merged in — otherwise the trigger would show
  // blank for an already-selected city once the list is filtered.
  const { data: selectedCity } = useCity(cityId)

  const cityOptions = useMemo(() => {
    if (selectedCity && !cities.some((c) => c.id === selectedCity.id)) {
      return [selectedCity, ...cities]
    }
    return cities
  }, [cities, selectedCity])

  return (
    <>
      <Select
        value={stateId ? String(stateId) : 'all'}
        onValueChange={(v) => {
          setCitySearch('')
          onChange({ stateId: v === 'all' ? null : Number(v), cityId: null })
        }}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os estados</SelectItem>
          {states.map((state) => (
            <SelectItem key={state.id} value={String(state.id)}>
              {state.name} ({state.uf})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex w-full flex-col gap-1 sm:w-44">
        <Input
          placeholder="Filtrar cidade…"
          value={citySearch}
          disabled={stateId === null}
          onChange={(e) => setCitySearch(e.target.value)}
        />
        <Select
          value={cityId ? String(cityId) : 'all'}
          disabled={stateId === null}
          onValueChange={(v) => {
            onChange({ stateId, cityId: v === 'all' ? null : Number(v) })
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {cityOptions.map((city) => (
              <SelectItem key={city.id} value={String(city.id)}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
