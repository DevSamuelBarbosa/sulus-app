import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useCities, useCity } from '@/modules/localization/hooks/useLocalization'

interface CityComboboxProps {
  stateId: number | null
  value: number | null
  onChange: (cityId: number | null) => void
  placeholder?: string
  className?: string
  /** Shows a "Todas as cidades" item that clears the selection — for filters, not forms. */
  allowClear?: boolean
  id?: string
}

/**
 * Searchable city select (Popover + Command) — replaces the old pattern of a
 * plain text Input filtering a Select below it.
 */
export function CityCombobox({
  stateId,
  value,
  onChange,
  placeholder = 'Cidade',
  className,
  allowClear = false,
  id,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timeout)
  }, [search])

  const { data: cities = [] } = useCities(stateId, debouncedSearch)
  // The selected city may fall outside the current search page, so it's
  // resolved directly and merged in — otherwise the trigger would show
  // blank for an already-selected city once the list is filtered.
  const { data: selectedCity } = useCity(value)

  const cityOptions = useMemo(() => {
    if (selectedCity && !cities.some((c) => c.id === selectedCity.id)) {
      return [selectedCity, ...cities]
    }
    return cities
  }, [cities, selectedCity])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={stateId === null}
          className={cn('w-full justify-between font-normal', !selectedCity && 'text-muted-foreground', className)}
        >
          {selectedCity ? selectedCity.name : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar cidade…" value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            <CommandGroup>
              {allowClear && (
                <CommandItem
                  onSelect={() => {
                    onChange(null)
                    setOpen(false)
                  }}
                >
                  <Check className={cn('mr-1', value !== null && 'opacity-0')} />
                  Todas as cidades
                </CommandItem>
              )}
              {cityOptions.map((city) => (
                <CommandItem
                  key={city.id}
                  value={String(city.id)}
                  onSelect={() => {
                    onChange(city.id)
                    setOpen(false)
                  }}
                >
                  <Check className={cn('mr-1', value !== city.id && 'opacity-0')} />
                  {city.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
