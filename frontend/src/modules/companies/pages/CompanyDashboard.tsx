import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmployeesPanel } from '@/modules/companies/components/EmployeesPanel'
import { CompanyProfilePanel } from '@/modules/companies/components/CompanyProfilePanel'

export function CompanyDashboard() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-tertiary">Painel da Empresa</h2>
        <p className="text-muted-foreground">Gestão de funcionários e dados cadastrais.</p>
      </div>

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
          <TabsTrigger value="profile">Meu perfil</TabsTrigger>
        </TabsList>
        <TabsContent value="employees">
          <EmployeesPanel />
        </TabsContent>
        <TabsContent value="profile">
          <CompanyProfilePanel />
        </TabsContent>
      </Tabs>
    </section>
  )
}
