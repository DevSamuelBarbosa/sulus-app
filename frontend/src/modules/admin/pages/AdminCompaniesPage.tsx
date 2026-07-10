import { CompaniesPanel } from '@/modules/admin/components/CompaniesPanel'

export function AdminCompaniesPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Empresas</h2>
        <p className="text-muted-foreground">Gestão global de empresas cadastradas na plataforma.</p>
      </div>
      <CompaniesPanel />
    </section>
  )
}
