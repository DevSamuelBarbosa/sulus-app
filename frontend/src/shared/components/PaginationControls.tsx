import { Button } from '@/components/ui/button'
import type { Paginated } from '@/shared/types'

interface PaginationControlsProps {
  meta: Paginated<unknown>['meta'] | undefined
  page: number
  onPageChange: (page: number) => void
}

export function PaginationControls({ meta, page, onPageChange }: PaginationControlsProps) {
  if (!meta || meta.last_page <= 1) return null

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Página {meta.current_page} de {meta.last_page} — {meta.total} registros
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= meta.last_page}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}
