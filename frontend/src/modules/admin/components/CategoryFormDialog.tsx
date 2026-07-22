import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getErrorMessage } from '@/shared/lib/errors'
import { useCreateCategory, useUpdateCategory } from '@/modules/categories/hooks/useCategories'
import type { Category } from '@/modules/categories/api/categories.api'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <CategoryForm
            key={category?.id ?? 'create'}
            category={category}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function CategoryForm({ category, onSaved }: { category?: Category | null; onSaved: () => void }) {
  const isEdit = Boolean(category)
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const [name, setName] = useState(category?.name ?? '')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    try {
      if (isEdit && category) {
        await updateCategory.mutateAsync({ id: category.id, name })
      } else {
        await createCategory.mutateAsync(name)
      }
      onSaved()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar a categoria. Talvez já exista uma com esse nome.'))
    }
  }

  const submitting = createCategory.isPending || updateCategory.isPending

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Atualize o nome da categoria de parceiro.' : 'Cria uma nova categoria de parceiro.'}
        </DialogDescription>
      </DialogHeader>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category_name">Nome</Label>
          <Input
            id="category_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Barbearias"
            required
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
