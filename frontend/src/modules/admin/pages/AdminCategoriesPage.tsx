import { CategoriesPanel } from '@/modules/admin/components/CategoriesPanel'

export function AdminCategoriesPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Categorias</h2>
        <p className="text-muted-foreground">Categorias de estabelecimentos parceiros.</p>
      </div>
      <CategoriesPanel />
    </section>
  )
}
