import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
          <TabsTrigger value="establishments">Estabelecimentos parceiros</TabsTrigger>
          <TabsTrigger value="profile">Meu perfil</TabsTrigger>
        </TabsList>
        <TabsContent value="employees">
          <EmployeesPanel />
        </TabsContent>
        <TabsContent value="establishments">
          <Card>
            <CardHeader>
              <CardTitle>Estabelecimentos parceiros</CardTitle>
              <CardDescription>
                Veja onde seus funcionários podem usar o benefício — busque por nome, categoria
                ou cidade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
                <Link to="/company/establishments">
                  <Search className="size-5" />
                  Buscar estabelecimentos
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="profile">
          <CompanyProfilePanel />
        </TabsContent>
      </Tabs>
    </section>
  )
}
