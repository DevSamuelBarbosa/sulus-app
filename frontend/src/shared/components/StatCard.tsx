import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: number | undefined
  /** Marks counts that represent something currently active/healthy. */
  accent?: boolean
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          {accent && <span className="size-1.5 shrink-0 rounded-full bg-secondary" aria-hidden />}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-foreground">{value ?? '—'}</p>
      </CardContent>
    </Card>
  )
}
