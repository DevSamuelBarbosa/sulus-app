import { Link } from 'react-router-dom'
import { ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EstablishmentDashboard() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-tertiary">Painel do Estabelecimento</h2>
        <p className="text-muted-foreground">Valide o QR Code do cliente para liberar o benefício.</p>
      </div>

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
    </section>
  )
}
