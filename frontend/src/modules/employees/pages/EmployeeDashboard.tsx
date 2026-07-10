import { Link } from 'react-router-dom'
import { QrCode, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EmployeeDashboard() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Painel do Funcionário</h2>
        <p className="text-muted-foreground">Gere seu QR Code para usar o benefício em um estabelecimento parceiro.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Meu benefício</CardTitle>
            <CardDescription>
              Toque no botão abaixo sempre que for usar o benefício — o código é gerado na hora e
              expira em poucos segundos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="gap-2">
              <Link to="/employee/qrcode">
                <QrCode className="size-4" />
                Gerar QR Code
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estabelecimentos parceiros</CardTitle>
            <CardDescription>
              Veja onde você pode usar o benefício — busque por nome, categoria ou cidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/employee/establishments">
                <Search className="size-4" />
                Buscar estabelecimentos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
