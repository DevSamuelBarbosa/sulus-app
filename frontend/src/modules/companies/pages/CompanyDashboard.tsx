import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function CompanyDashboard() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-tertiary">Painel da Empresa</h2>
        <p className="text-muted-foreground">Gestão de funcionários, benefícios e relatórios (Fase 2+).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
          <CardDescription>Este painel será implementado na Fase 2.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </section>
  )
}
