import { useState } from 'react'
import { localizationApi } from '@/modules/localization/api/localization.api'
import { useCities, useStates } from '@/modules/localization/hooks/useLocalization'
import type { AddressValue } from '@/modules/localization/types'

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
    <div className="address-form">
      <div className="field">
        <label htmlFor="cep">CEP</label>
        <input
          id="cep"
          value={value.cep}
          onChange={(e) => patch({ cep: e.target.value })}
          onBlur={handleCepBlur}
          placeholder="00000-000"
        />
        {cepStatus === 'loading' && <small>Buscando endereço…</small>}
        {cepStatus === 'error' && <small className="error">CEP não encontrado — preencha manualmente.</small>}
      </div>

      <div className="field">
        <label htmlFor="logradouro">Logradouro</label>
        <input
          id="logradouro"
          value={value.logradouro}
          onChange={(e) => patch({ logradouro: e.target.value })}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="numero">Número</label>
          <input id="numero" value={value.numero} onChange={(e) => patch({ numero: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="complemento">Complemento</label>
          <input
            id="complemento"
            value={value.complemento}
            onChange={(e) => patch({ complemento: e.target.value })}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="bairro">Bairro</label>
        <input id="bairro" value={value.bairro} onChange={(e) => patch({ bairro: e.target.value })} />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="state">Estado</label>
          <select
            id="state"
            value={value.state_id ?? ''}
            onChange={(e) =>
              patch({ state_id: e.target.value ? Number(e.target.value) : null, city_id: null })
            }
          >
            <option value="">Selecione…</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name} ({state.uf})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="city">Cidade</label>
          <input
            placeholder="Filtrar cidade…"
            value={citySearch}
            disabled={value.state_id === null}
            onChange={(e) => setCitySearch(e.target.value)}
          />
          <select
            id="city"
            value={value.city_id ?? ''}
            disabled={value.state_id === null}
            onChange={(e) => patch({ city_id: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Selecione…</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
