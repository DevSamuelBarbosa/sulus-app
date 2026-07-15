import { Link } from 'react-router-dom'
import { ScanLine, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EstablishmentDashboard() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Painel do Estabelecimento</h2>
        <p className="text-muted-foreground">Valide o QR Code do cliente para liberar o benefício.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Validar benefício</CardTitle>
            <CardDescription>
              Escaneie o QR Code exibido pelo cliente no balcão para conferir a foto, o nome e a
              empresa antes de liberar o desconto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2">
              <Link to="/establishment/scan">
                <ScanLine className="size-4" />
                Validar QR Code
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresas parceiras</CardTitle>
            <CardDescription>
              Veja quais empresas têm clientes que podem usar o benefício aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/establishment/companies">
                <Search className="size-4" />
                Buscar empresas
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meu perfil</CardTitle>
            <CardDescription>
              Atualize categoria, descrição e endereço — isso é o que aparece na busca.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/establishment/profile">
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
