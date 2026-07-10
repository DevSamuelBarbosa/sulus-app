import { CompanyProfilePanel } from '@/modules/companies/components/CompanyProfilePanel'

export function CompanyProfilePage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Meu perfil</h2>
        <p className="text-muted-foreground">Dados cadastrais da empresa.</p>
      </div>
      <CompanyProfilePanel />
    </section>
  )
}
