import { Link } from 'react-router-dom'
import { ScanLine, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EstablishmentProfilePanel } from '@/modules/establishments/components/EstablishmentProfilePanel'

export function EstablishmentDashboard() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-tertiary">Painel do Estabelecimento</h2>
        <p className="text-muted-foreground">Valide o QR Code do cliente para liberar o benefício.</p>
      </div>

      <Tabs defaultValue="actions">
        <TabsList>
          <TabsTrigger value="actions">Ações</TabsTrigger>
          <TabsTrigger value="profile">Meu perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Validar benefício</CardTitle>
              <CardDescription>
                Escaneie o QR Code exibido pelo cliente no balcão para conferir a foto, o nome e a
                empresa antes de liberar o desconto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
                <Link to="/establishment/scan">
                  <ScanLine className="size-5" />
                  Validar QR Code
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Empresas parceiras</CardTitle>
              <CardDescription>
                Veja quais empresas têm funcionários que podem usar o benefício aqui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                <Link to="/establishment/companies">
                  <Search className="size-5" />
                  Buscar empresas
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <EstablishmentProfilePanel />
        </TabsContent>
      </Tabs>
    </section>
  )
}
