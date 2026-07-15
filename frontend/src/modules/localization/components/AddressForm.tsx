import { useState } from 'react'
import { localizationApi } from '@/modules/localization/api/localization.api'
import { useStates } from '@/modules/localization/hooks/useLocalization'
import type { AddressValue } from '@/modules/localization/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StateSelect } from '@/shared/components/StateSelect'
import { CityCombobox } from '@/shared/components/CityCombobox'

interface AddressFormProps {
  value: AddressValue
  onChange: (value: AddressValue) => void
}

/** Digits-only CEP formatted as "00000-000" for display. */
function formatCep(cep: string): string {
  const digits = cep.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

/**
 * Canonical address input: CEP autofills via ViaCEP and resolves the city to
 * the IBGE-backed `city_id`. State/city are always selected (never free text),
 * so duplicates like "marau"/"Marau" cannot occur.
 *
 * `value.cep` is always kept as digits-only in state (the API validates it as
 * `digits:8`); the "00000-000" mask is applied only for display.
 *
 * CEP lookup only resolves `state_id`/`city_id` (the canonical geo match this
 * feature exists for). It never touches logradouro/bairro/numero/complemento:
 * ViaCEP granularity varies — generic city-wide CEPs return blank
 * logradouro/bairro — and overwriting user-typed values with those blanks
 * would clobber data the user is expected to fill in manually.
 */
export function AddressForm({ value, onChange }: AddressFormProps) {
  const { data: states = [] } = useStates()
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  const patch = (partial: Partial<AddressValue>) => onChange({ ...value, ...partial })

  async function handleCepBlur() {
    if (value.cep.length !== 8) {
      return
    }

    setCepStatus('loading')
    const result = await localizationApi.lookupCep(value.cep)
    if (!result) {
      setCepStatus('error')
      return
    }

    const state = states.find((s) => s.uf === result.uf) ?? null
    let cityId: number | null = null
    if (state) {
      // Resolve city by IBGE code within the resolved state.
      const matches = await localizationApi.getCities({ stateId: state.id, search: result.localidade })
      cityId = matches.find((c) => c.ibge_code === result.ibge)?.id ?? null
    }

    setCepStatus('idle')
    onChange({
      ...value,
      cep: result.cep.replace(/\D/g, ''),
      state_id: state?.id ?? null,
      city_id: cityId,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cep">CEP</Label>
        <Input
          id="cep"
          value={formatCep(value.cep)}
          onChange={(e) => patch({ cep: e.target.value.replace(/\D/g, '').slice(0, 8) })}
          onBlur={handleCepBlur}
          placeholder="00000-000"
        />
        {cepStatus === 'loading' && (
          <p className="text-xs text-muted-foreground">Buscando endereço…</p>
        )}
        {cepStatus === 'error' && (
          <p className="text-xs text-destructive">CEP não encontrado — preencha manualmente.</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="logradouro">Logradouro</Label>
        <Input
          id="logradouro"
          value={value.logradouro}
          onChange={(e) => patch({ logradouro: e.target.value })}
          placeholder="Rua, avenida…"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="numero">Número</Label>
          <Input
            id="numero"
            value={value.numero}
            onChange={(e) => patch({ numero: e.target.value })}
            placeholder="123"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            value={value.complemento}
            onChange={(e) => patch({ complemento: e.target.value })}
            placeholder="Apto, sala… (opcional)"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bairro">Bairro</Label>
        <Input
          id="bairro"
          value={value.bairro}
          onChange={(e) => patch({ bairro: e.target.value })}
          placeholder="Bairro"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">Estado</Label>
          <StateSelect
            id="state"
            value={value.state_id}
            onChange={(stateId) => patch({ state_id: stateId, city_id: null })}
            placeholder="Selecione…"
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">Cidade</Label>
          <CityCombobox
            id="city"
            stateId={value.state_id}
            value={value.city_id}
            onChange={(cityId) => patch({ city_id: cityId })}
            placeholder="Selecione…"
          />
        </div>
      </div>
    </div>
  )
}
