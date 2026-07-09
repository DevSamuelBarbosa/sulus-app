import { Button } from '@/components/ui/button'
import type { Paginated } from '@/shared/types'

interface PaginationBarProps {
  meta: Paginated<unknown>['meta']
  onPageChange: (page: number) => void
}

export function PaginationBar({ meta, onPageChange }: PaginationBarProps) {
  if (meta.last_page <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {meta.total} resultado{meta.total === 1 ? '' : 's'} — página {meta.current_page} de{' '}
        {meta.last_page}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.current_page <= 1}
          onClick={() => onPageChange(meta.current_page - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}
