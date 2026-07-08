import { useRef, useState } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  useCreateEmployee,
  useUpdateEmployee,
  useUploadEmployeePhoto,
} from '@/modules/companies/hooks/useCompany'
import type { Employee } from '@/modules/companies/types'

interface EmployeeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null
}

export function EmployeeFormDialog({ open, onOpenChange, employee }: EmployeeFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        {open && (
          <EmployeeForm
            key={employee?.id ?? 'create'}
            employee={employee}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function EmployeeForm({ employee, onSaved }: { employee?: Employee | null; onSaved: () => void }) {
  const isEdit = Boolean(employee)
  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee()
  const uploadPhoto = useUploadEmployeePhoto()
  const fileInput = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    email: employee?.login_email ?? '',
    password: '',
    full_name: employee?.full_name ?? '',
    cpf: employee?.cpf ?? '',
    phone: employee?.phone ?? '',
    hired_at: employee?.hired_at ?? '',
  })
  const [error, setError] = useState<string | null>(null)

  const patch = (partial: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...partial }))

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !employee) return
    setError(null)
    try {
      await uploadPhoto.mutateAsync({ id: employee.id, file })
    } catch {
      setError('Não foi possível enviar a foto. Use uma imagem de até 4 MB.')
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    try {
      if (isEdit && employee) {
        await updateEmployee.mutateAsync({
          id: employee.id,
          payload: {
            full_name: form.full_name,
            cpf: form.cpf,
            phone: form.phone || null,
            hired_at: form.hired_at || null,
          },
        })
      } else {
        await createEmployee.mutateAsync({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          cpf: form.cpf,
          phone: form.phone || null,
          hired_at: form.hired_at || null,
        })
      }
      onSaved()
    } catch {
      setError('Não foi possível salvar o funcionário. Confira os dados e tente novamente.')
    }
  }

  const submitting = createEmployee.isPending || updateEmployee.isPending

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Editar funcionário' : 'Novo funcionário'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Atualize os dados do funcionário e a foto de identificação.'
            : 'Cria o acesso de login e o perfil do funcionário.'}
        </DialogDescription>
      </DialogHeader>

      {isEdit && employee && (
        <div className="flex items-center gap-4 rounded-lg border border-border p-3">
          <Avatar className="size-16">
            {employee.photo_url && <AvatarImage src={employee.photo_url} alt={employee.full_name} />}
            <AvatarFallback>{initials(form.full_name || employee.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">
              Foto usada na conferência visual do benefício.
            </span>
            <div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadPhoto.isPending}
                onClick={() => fileInput.current?.click()}
              >
                {uploadPhoto.isPending ? 'Enviando…' : employee.photo_url ? 'Trocar foto' : 'Enviar foto'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail de login</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => patch({ email: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => patch({ password: e.target.value })}
                minLength={8}
                required
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input
            id="full_name"
            value={form.full_name}
            onChange={(e) => patch({ full_name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={form.cpf}
              onChange={(e) => patch({ cpf: e.target.value.replace(/\D/g, '') })}
              maxLength={11}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => patch({ phone: e.target.value })} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hired_at">Data de admissão</Label>
          <Input
            id="hired_at"
            type="date"
            value={form.hired_at ?? ''}
            onChange={(e) => patch({ hired_at: e.target.value })}
            className="max-w-xs"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
