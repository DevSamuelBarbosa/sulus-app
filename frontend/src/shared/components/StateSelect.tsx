import { useStates } from '@/modules/localization/hooks/useLocalization'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface StateSelectProps {
  value: number | null
  onChange: (stateId: number | null) => void
  placeholder?: string
  allowAll?: boolean
  className?: string
  id?: string
}

/** Plain Select for the 27 UFs — a short static list, no search needed. */
export function StateSelect({
  value,
  onChange,
  placeholder = 'Estado',
  allowAll = false,
  className,
  id,
}: StateSelectProps) {
  const { data: states = [] } = useStates()

  return (
    <Select
      value={value ? String(value) : allowAll ? 'all' : ''}
      onValueChange={(v) => onChange(v === 'all' ? null : Number(v))}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowAll && <SelectItem value="all">Todos os estados</SelectItem>}
        {states.map((state) => (
          <SelectItem key={state.id} value={String(state.id)}>
            {state.name} ({state.uf})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
