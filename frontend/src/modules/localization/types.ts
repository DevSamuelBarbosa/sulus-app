export interface State {
  id: number
  ibge_code: string
  uf: string
  name: string
}

export interface City {
  id: number
  ibge_code: string
  state_id: number
  uf: string | null
  name: string
  latitude: string | null
  longitude: string | null
}

/** Raw ViaCEP payload (https://viacep.com.br/ws/{cep}/json). */
export interface ViaCepResult {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  erro?: boolean
}

export interface AddressValue {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  state_id: number | null
  city_id: number | null
}

export const emptyAddress: AddressValue = {
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  state_id: null,
  city_id: null,
}
