import { EstablishmentProfilePanel } from '@/modules/establishments/components/EstablishmentProfilePanel'

export function EstablishmentSettingsPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Meu perfil</h2>
        <p className="text-muted-foreground">
          Dados que aparecem para empresas e clientes na busca de estabelecimentos parceiros.
        </p>
      </div>
      <EstablishmentProfilePanel />
    </section>
  )
}
