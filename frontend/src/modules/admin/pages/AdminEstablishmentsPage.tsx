import { EstablishmentsPanel } from '@/modules/admin/components/EstablishmentsPanel'

export function AdminEstablishmentsPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Estabelecimentos</h2>
        <p className="text-muted-foreground">
          Gestão global de estabelecimentos parceiros cadastrados na plataforma.
        </p>
      </div>
      <EstablishmentsPanel />
    </section>
  )
}
