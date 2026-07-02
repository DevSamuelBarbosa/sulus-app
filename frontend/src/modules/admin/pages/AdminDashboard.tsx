import { useState } from 'react'
import { AddressForm } from '@/modules/localization/components/AddressForm'
import { emptyAddress } from '@/modules/localization/types'
import type { AddressValue } from '@/modules/localization/types'

export function AdminDashboard() {
  const [address, setAddress] = useState<AddressValue>(emptyAddress)

  return (
    <section>
      <h2>Painel do Administrador</h2>
      <p>Gestão global de empresas e estabelecimentos (Fase 1+).</p>

      <div className="card">
        <h3>Componente de endereço (preview)</h3>
        <p className="hint">
          CEP preenche via ViaCEP e resolve a cidade para o <code>city_id</code> canônico (IBGE).
        </p>
        <AddressForm value={address} onChange={setAddress} />
        <pre className="debug">{JSON.stringify(address, null, 2)}</pre>
      </div>
    </section>
  )
}
