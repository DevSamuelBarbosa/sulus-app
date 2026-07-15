import { StateSelect } from '@/shared/components/StateSelect'
import { CityCombobox } from '@/shared/components/CityCombobox'

interface LocationFilterProps {
  stateId: number | null
  cityId: number | null
  onChange: (value: { stateId: number | null; cityId: number | null }) => void
}

/** State→city filter pair, used across discovery search and admin listings. */
export function LocationFilter({ stateId, cityId, onChange }: LocationFilterProps) {
  return (
    // Kept as a single non-wrapping unit so city never drops to its own line
    // while state stays put — the two only ever move together as a pair.
    <div className="flex shrink-0 gap-2">
      <StateSelect
        value={stateId}
        onChange={(next) => onChange({ stateId: next, cityId: null })}
        placeholder="Estado"
        allowAll
        className="w-36 shrink-0 sm:w-44"
      />

      <CityCombobox
        stateId={stateId}
        value={cityId}
        onChange={(next) => onChange({ stateId, cityId: next })}
        placeholder="Cidade"
        className="w-36 shrink-0 sm:w-44"
        allowClear
      />
    </div>
  )
}
