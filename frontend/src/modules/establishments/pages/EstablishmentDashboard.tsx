import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EstablishmentDashboard() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-tertiary">Painel do Estabelecimento</h2>
        <p className="text-muted-foreground">Validação de QR Code e histórico de clientes (Fase 3+).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
          <CardDescription>Este painel será implementado na Fase 3.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </section>
  )
}
