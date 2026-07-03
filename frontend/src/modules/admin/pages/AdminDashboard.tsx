import { useState } from 'react'
import { AddressForm } from '@/modules/localization/components/AddressForm'
import { emptyAddress } from '@/modules/localization/types'
import type { AddressValue } from '@/modules/localization/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AdminDashboard() {
  const [address, setAddress] = useState<AddressValue>(emptyAddress)

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-tertiary">Painel do Administrador</h2>
        <p className="text-muted-foreground">Gestão global de empresas e estabelecimentos (Fase 1+).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Componente de endereço
            <Badge variant="secondary">preview</Badge>
          </CardTitle>
          <CardDescription>
            CEP preenche via ViaCEP e resolve a cidade para o <code>city_id</code> canônico (IBGE).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AddressForm value={address} onChange={setAddress} />
          <pre className="overflow-x-auto rounded-lg bg-tertiary p-3 text-xs text-tertiary-foreground">
            {JSON.stringify(address, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </section>
  )
}
