import { useState } from 'react'
import { localizationApi } from '@/modules/localization/api/localization.api'
import { useCities, useStates } from '@/modules/localization/hooks/useLocalization'
import type { AddressValue } from '@/modules/localization/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddressFormProps {
  value: AddressValue
  onChange: (value: AddressValue) => void
}

/**
 * Canonical address input: CEP autofills via ViaCEP and resolves the city to
 * the IBGE-backed `city_id`. State/city are always selected (never free text),
 * so duplicates like "marau"/"Marau" cannot occur.
 */
export function AddressForm({ value, onChange }: AddressFormProps) {
  const { data: states = [] } = useStates()
  const [citySearch, setCitySearch] = useState('')
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  const { data: cities = [] } = useCities(value.state_id, citySearch)

  const patch = (partial: Partial<AddressValue>) => onChange({ ...value, ...partial })

  async function handleCepBlur() {
    if (value.cep.replace(/\D/g, '').length !== 8) {
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
      cep: result.cep,
      logradouro: result.logradouro,
      bairro: result.bairro,
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
          value={value.cep}
          onChange={(e) => patch({ cep: e.target.value })}
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
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="numero">Número</Label>
          <Input id="numero" value={value.numero} onChange={(e) => patch({ numero: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="complemento">Complemento</Label>
          <Input
            id="complemento"
            value={value.complemento}
            onChange={(e) => patch({ complemento: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bairro">Bairro</Label>
        <Input id="bairro" value={value.bairro} onChange={(e) => patch({ bairro: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="state">Estado</Label>
          <Select
            value={value.state_id ? String(value.state_id) : ''}
            onValueChange={(v) => patch({ state_id: v ? Number(v) : null, city_id: null })}
          >
            <SelectTrigger id="state" className="w-full">
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.id} value={String(state.id)}>
                  {state.name} ({state.uf})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">Cidade</Label>
          <Input
            placeholder="Filtrar cidade…"
            value={citySearch}
            disabled={value.state_id === null}
            onChange={(e) => setCitySearch(e.target.value)}
          />
          <Select
            value={value.city_id ? String(value.city_id) : ''}
            disabled={value.state_id === null}
            onValueChange={(v) => patch({ city_id: v ? Number(v) : null })}
          >
            <SelectTrigger id="city" className="w-full">
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={String(city.id)}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
