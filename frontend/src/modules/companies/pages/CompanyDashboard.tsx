import { Link } from 'react-router-dom'
import { Search, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function CompanyDashboard() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Painel da Empresa</h2>
        <p className="text-muted-foreground">Gestão de funcionários e dados cadastrais.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funcionários</CardTitle>
            <CardDescription>Gerencie quem tem acesso ao benefício.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/company/employees">
                <Users className="size-4" />
                Ver funcionários
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estabelecimentos parceiros</CardTitle>
            <CardDescription>
              Veja onde seus funcionários podem usar o benefício — busque por nome, categoria ou
              cidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/company/establishments">
                <Search className="size-4" />
                Buscar estabelecimentos
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meu perfil</CardTitle>
            <CardDescription>Atualize os dados cadastrais da empresa.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/company/profile">
                <Settings className="size-4" />
                Editar perfil
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
