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
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FormSection } from '@/shared/components/FormSection'
import { getErrorMessage } from '@/shared/lib/errors'
import { AddressForm } from '@/modules/localization/components/AddressForm'
import { emptyAddress } from '@/modules/localization/types'
import type { AddressValue } from '@/modules/localization/types'
import { useCreateCompany, useUpdateCompany, useUploadCompanyLogo } from '@/modules/admin/hooks/useAdmin'
import type { AdminCompany } from '@/modules/admin/types'

interface CompanyFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: AdminCompany | null
}

function addressFromCompany(company?: AdminCompany | null): AddressValue {
  if (!company) return emptyAddress
  return {
    cep: company.cep ?? '',
    logradouro: company.logradouro ?? '',
    numero: company.numero ?? '',
    complemento: company.complemento ?? '',
    bairro: company.bairro ?? '',
    state_id: company.city?.state_id ?? null,
    city_id: company.city_id,
  }
}

export function CompanyFormDialog({ open, onOpenChange, company }: CompanyFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl overflow-y-auto">
        {open && (
          <CompanyForm
            key={company?.id ?? 'create'}
            company={company}
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

function CompanyForm({ company, onSaved }: { company?: AdminCompany | null; onSaved: () => void }) {
  const isEdit = Boolean(company)
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const uploadLogo = useUploadCompanyLogo()
  const fileInput = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState({
    legal_name: company?.legal_name ?? '',
    trade_name: company?.trade_name ?? '',
    cnpj: company?.cnpj ?? '',
    phone: company?.phone ?? '',
    contact_email: company?.contact_email ?? '',
    is_active: company?.is_active ?? true,
  })
  const [address, setAddress] = useState<AddressValue>(() => addressFromCompany(company))
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const patch = (partial: Partial<typeof profile>) => setProfile((prev) => ({ ...prev, ...partial }))

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (isEdit && company) {
      try {
        await uploadLogo.mutateAsync({ id: company.id, file })
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
      if (isEdit && company) {
        await updateCompany.mutateAsync({
          id: company.id,
          payload: {
            legal_name: profile.legal_name,
            trade_name: profile.trade_name || null,
            cnpj: profile.cnpj,
            phone: profile.phone || null,
            contact_email: profile.contact_email || null,
            is_active: profile.is_active,
            ...addressPayload,
          },
        })
      } else {
        await createCompany.mutateAsync({
          legal_name: profile.legal_name,
          trade_name: profile.trade_name || null,
          cnpj: profile.cnpj,
          phone: profile.phone || null,
          contact_email: profile.contact_email || null,
          is_active: profile.is_active,
          logo: logoFile,
          ...addressPayload,
        })
      }
      onSaved()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar a empresa. Confira os dados e tente novamente.'))
    }
  }

  const submitting = createCompany.isPending || updateCompany.isPending

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Editar empresa' : 'Nova empresa'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Atualize os dados cadastrais da empresa.'
            : 'Cria o perfil da empresa. Os logins são criados depois, na tela de Usuários.'}
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-4 rounded-lg border border-border p-3">
        <Avatar className="size-16">
          {(logoPreview ?? company?.logo_url) && (
            <AvatarImage src={logoPreview ?? company!.logo_url!} alt={profile.legal_name} />
          )}
          <AvatarFallback>{initials(profile.legal_name || 'E')}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-muted-foreground">
            Logo exibido no perfil da empresa. Só o admin pode alterá-lo.
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
                : (logoPreview ?? company?.logo_url)
                  ? 'Trocar logo'
                  : 'Enviar logo'}
            </Button>
          </div>
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <FormSection title="Dados da empresa">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="legal_name">Razão social</Label>
            <Input
              id="legal_name"
              value={profile.legal_name}
              onChange={(e) => patch({ legal_name: e.target.value })}
              placeholder="Razão social"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trade_name">Nome fantasia</Label>
              <Input
                id="trade_name"
                value={profile.trade_name}
                onChange={(e) => patch({ trade_name: e.target.value })}
                placeholder="Nome fantasia (opcional)"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={profile.cnpj}
                onChange={(e) => patch({ cnpj: e.target.value.replace(/\D/g, '') })}
                placeholder="Somente números"
                maxLength={14}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => patch({ phone: e.target.value })}
                placeholder="(00) 0000-0000"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contact_email">E-mail de contato</Label>
              <Input
                id="contact_email"
                type="email"
                value={profile.contact_email}
                onChange={(e) => patch({ contact_email: e.target.value })}
                placeholder="contato@empresa.com"
              />
            </div>
          </div>
        </FormSection>

        <Separator />

        <FormSection title="Endereço">
          <AddressForm value={address} onChange={setAddress} />
        </FormSection>

        <Separator />

        <div className="flex items-center gap-2">
          <Switch
            id="is_active"
            checked={profile.is_active}
            onCheckedChange={(checked) => patch({ is_active: checked })}
          />
          <Label htmlFor="is_active">Empresa ativa</Label>
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
