import { StateSelect } from '@/shared/components/StateSelect'
import { CityCombobox } from '@/shared/components/CityCombobox'
import { Label } from '@/components/ui/label'

interface LocationFilterProps {
  stateId: number | null
  cityId: number | null
  onChange: (value: { stateId: number | null; cityId: number | null }) => void
  /** Labels above each select — opt-in so discovery search (compact, no
   * other labeled filters around it) keeps its current unlabeled look. */
  showLabels?: boolean
}

/** State→city filter pair, used across discovery search and admin listings. */
export function LocationFilter({ stateId, cityId, onChange, showLabels }: LocationFilterProps) {
  return (
    // Kept as a single non-wrapping unit so city never drops to its own line
    // while state stays put — the two only ever move together as a pair.
    <div className="flex shrink-0 gap-2">
      <div className="flex flex-col gap-1.5">
        {showLabels && <Label htmlFor="location-filter-state">Estado</Label>}
        <StateSelect
          id="location-filter-state"
          value={stateId}
          onChange={(next) => onChange({ stateId: next, cityId: null })}
          placeholder="Estado"
          allowAll
          className="w-36 shrink-0 sm:w-44"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        {showLabels && <Label htmlFor="location-filter-city">Cidade</Label>}
        <CityCombobox
          id="location-filter-city"
          stateId={stateId}
          value={cityId}
          onChange={(next) => onChange({ stateId, cityId: next })}
          placeholder="Cidade"
          className="w-36 shrink-0 sm:w-44"
          allowClear
        />
      </div>
    </div>
  )
}
