import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RankedListCardProps {
  title: string
  items: { name: string; count: number }[] | undefined
  emptyLabel?: string
  totalCount?: number
}

export function RankedListCard({ title, items, emptyLabel = 'Sem dados ainda.', totalCount }: RankedListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-baseline justify-between gap-2 text-sm font-medium text-muted-foreground">
          <span>{title}</span>
          {totalCount !== undefined && (
            <span className="shrink-0 font-normal">{totalCount} no total</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          <ol className="flex flex-col gap-2">
            {items.map((item, index) => (
              <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 truncate">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="shrink-0 font-medium text-foreground">{item.count}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </CardContent>
    </Card>
  )
}
