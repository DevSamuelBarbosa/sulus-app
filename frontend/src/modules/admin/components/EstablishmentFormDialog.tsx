import { useRef, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getErrorMessage } from '@/shared/lib/errors'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormSection } from '@/shared/components/FormSection'
import { AddressForm } from '@/modules/localization/components/AddressForm'
import { emptyAddress } from '@/modules/localization/types'
import type { AddressValue } from '@/modules/localization/types'
import {
  useCreateEstablishment,
  useUpdateEstablishment,
  useUploadEstablishmentLogo,
} from '@/modules/admin/hooks/useAdmin'
import { useCategories } from '@/modules/categories/hooks/useCategories'
import type { AdminEstablishment } from '@/modules/admin/types'

interface EstablishmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  establishment?: AdminEstablishment | null
}

function addressFromEstablishment(establishment?: AdminEstablishment | null): AddressValue {
  if (!establishment) return emptyAddress
  return {
    cep: establishment.cep ?? '',
    logradouro: establishment.logradouro ?? '',
    numero: establishment.numero ?? '',
    complemento: establishment.complemento ?? '',
    bairro: establishment.bairro ?? '',
    state_id: establishment.city?.state_id ?? null,
    city_id: establishment.city_id,
  }
}

export function EstablishmentFormDialog({
  open,
  onOpenChange,
  establishment,
}: EstablishmentFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-y-auto">
        {open && (
          <EstablishmentForm
            key={establishment?.id ?? 'create'}
            establishment={establishment}
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

function EstablishmentForm({
  establishment,
  onSaved,
}: {
  establishment?: AdminEstablishment | null
  onSaved: () => void
}) {
  const isEdit = Boolean(establishment)
  const createEstablishment = useCreateEstablishment()
  const updateEstablishment = useUpdateEstablishment()
  const uploadLogo = useUploadEstablishmentLogo()
  const fileInput = useRef<HTMLInputElement>(null)
  const { data: categories = [] } = useCategories()
  const [profile, setProfile] = useState({
    name: establishment?.name ?? '',
    cnpj: establishment?.cnpj ?? '',
    category_id: establishment?.category_id ?? (null as number | null),
    description: establishment?.description ?? '',
    phone: establishment?.phone ?? '',
    is_active: establishment?.is_active ?? true,
  })
  const [address, setAddress] = useState<AddressValue>(() => addressFromEstablishment(establishment))
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const patch = (partial: Partial<typeof profile>) => setProfile((prev) => ({ ...prev, ...partial }))

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (isEdit && establishment) {
      try {
        await uploadLogo.mutateAsync({ id: establishment.id, file })
      } catch (err) {
        toast.error(getErrorMessage(err, 'Não foi possível enviar o logo. Use uma imagem de até 4 MB.'))
      } finally {
        if (fileInput.current) fileInput.current.value = ''
      }
    } else {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const addressPayload = {
      cep: address.cep || null,
      logradouro: address.logradouro || null,
      numero: address.numero || null,
      complemento: address.complemento || null,
      bairro: address.bairro || null,
      city_id: address.city_id,
    }

    try {
      if (isEdit && establishment) {
        await updateEstablishment.mutateAsync({
          id: establishment.id,
          payload: {
            name: profile.name,
            cnpj: profile.cnpj,
            category_id: profile.category_id,
            description: profile.description || null,
            phone: profile.phone || null,
            is_active: profile.is_active,
            ...addressPayload,
          },
        })
      } else {
        await createEstablishment.mutateAsync({
          name: profile.name,
          cnpj: profile.cnpj,
          category_id: profile.category_id,
          description: profile.description || null,
          phone: profile.phone || null,
          is_active: profile.is_active,
          logo: logoFile,
          ...addressPayload,
        })
      }
      onSaved()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar o estabelecimento. Confira os dados e tente novamente.'))
    }
  }

  const submitting = createEstablishment.isPending || updateEstablishment.isPending

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Editar estabelecimento' : 'Novo estabelecimento'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Atualize os dados cadastrais do estabelecimento.'
            : 'Cria o perfil do estabelecimento parceiro. Os logins são criados depois, na tela de Usuários.'}
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-4 rounded-lg border border-border p-3">
        <Avatar className="size-16">
          {(logoPreview ?? establishment?.logo_url) && (
            <AvatarImage src={logoPreview ?? establishment!.logo_url!} alt={profile.name} />
          )}
          <AvatarFallback>{initials(profile.name || 'E')}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            Logo exibido no perfil do estabelecimento. Só o admin pode alterá-lo.
          </span>
          <div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadLogo.isPending}
              onClick={() => fileInput.current?.click()}
            >
              {uploadLogo.isPending
                ? 'Enviando…'
                : (logoPreview ?? establishment?.logo_url)
                  ? 'Trocar logo'
                  : 'Enviar logo'}
            </Button>
          </div>
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <FormSection title="Dados do estabelecimento">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e_name">Nome do estabelecimento</Label>
            <Input
              id="e_name"
              value={profile.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Nome do estabelecimento"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="e_cnpj">CNPJ</Label>
              <Input
                id="e_cnpj"
                value={profile.cnpj}
                onChange={(e) => patch({ cnpj: e.target.value.replace(/\D/g, '') })}
                placeholder="Somente números"
                maxLength={14}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="e_category">Categoria</Label>
              <Select
                value={profile.category_id ? String(profile.category_id) : ''}
                onValueChange={(v) => patch({ category_id: v ? Number(v) : null })}
              >
                <SelectTrigger id="e_category" className="w-full">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e_phone">Telefone</Label>
            <Input
              id="e_phone"
              value={profile.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="e_description">Descrição</Label>
            <Textarea
              id="e_description"
              value={profile.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Descreva o estabelecimento (opcional)"
              rows={3}
            />
          </div>
        </FormSection>

        <Separator />

        <FormSection title="Endereço">
          <AddressForm value={address} onChange={setAddress} />
        </FormSection>

        <Separator />

        <div className="flex items-center gap-2">
          <Switch
            id="e_is_active"
            checked={profile.is_active}
            onCheckedChange={(checked) => patch({ is_active: checked })}
          />
          <Label htmlFor="e_is_active">Estabelecimento ativo</Label>
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
