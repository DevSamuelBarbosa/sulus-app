import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function EmployeeDashboard() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-tertiary">Painel do Funcionário</h2>
        <p className="text-muted-foreground">QR Code de benefício e histórico de utilizações (Fase 3+).</p>
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
