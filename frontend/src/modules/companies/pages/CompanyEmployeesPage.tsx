import { EmployeesPanel } from '@/modules/companies/components/EmployeesPanel'

export function CompanyEmployeesPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Funcionários</h2>
        <p className="text-muted-foreground">Gerencie quem tem acesso ao benefício.</p>
      </div>
      <EmployeesPanel />
    </section>
  )
}
