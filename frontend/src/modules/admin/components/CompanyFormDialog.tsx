import { useState } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AddressForm } from '@/modules/localization/components/AddressForm'
import { emptyAddress } from '@/modules/localization/types'
import type { AddressValue } from '@/modules/localization/types'
import { useCreateCompany, useUpdateCompany } from '@/modules/admin/hooks/useAdmin'
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
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
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

function CompanyForm({ company, onSaved }: { company?: AdminCompany | null; onSaved: () => void }) {
  const isEdit = Boolean(company)
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const [profile, setProfile] = useState({
    user_name: '',
    email: company?.login_email ?? '',
    password: '',
    legal_name: company?.legal_name ?? '',
    trade_name: company?.trade_name ?? '',
    cnpj: company?.cnpj ?? '',
    phone: company?.phone ?? '',
    contact_email: company?.contact_email ?? '',
    is_active: company?.is_active ?? true,
  })
  const [address, setAddress] = useState<AddressValue>(() => addressFromCompany(company))
  const [error, setError] = useState<string | null>(null)

  const patch = (partial: Partial<typeof profile>) => setProfile((prev) => ({ ...prev, ...partial }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

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
          user_name: profile.user_name,
          email: profile.email,
          password: profile.password,
          legal_name: profile.legal_name,
          trade_name: profile.trade_name || null,
          cnpj: profile.cnpj,
          phone: profile.phone || null,
          contact_email: profile.contact_email || null,
          is_active: profile.is_active,
          ...addressPayload,
        })
      }
      onSaved()
    } catch {
      setError('Não foi possível salvar a empresa. Confira os dados e tente novamente.')
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
            : 'Cria o usuário de login e o perfil da empresa.'}
        </DialogDescription>
      </DialogHeader>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {!isEdit && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user_name">Nome do responsável (login)</Label>
              <Input
                id="user_name"
                value={profile.user_name}
                onChange={(e) => patch({ user_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">E-mail de login</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => patch({ email: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={profile.password}
                  onChange={(e) => patch({ password: e.target.value })}
                  minLength={8}
                  required
                />
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="legal_name">Razão social</Label>
          <Input
            id="legal_name"
            value={profile.legal_name}
            onChange={(e) => patch({ legal_name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trade_name">Nome fantasia</Label>
            <Input
              id="trade_name"
              value={profile.trade_name}
              onChange={(e) => patch({ trade_name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={profile.cnpj}
              onChange={(e) => patch({ cnpj: e.target.value.replace(/\D/g, '') })}
              maxLength={14}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={profile.phone} onChange={(e) => patch({ phone: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact_email">E-mail de contato</Label>
            <Input
              id="contact_email"
              type="email"
              value={profile.contact_email}
              onChange={(e) => patch({ contact_email: e.target.value })}
            />
          </div>
        </div>

        <AddressForm value={address} onChange={setAddress} />

        <div className="flex items-center gap-2">
          <Switch
            id="is_active"
            checked={profile.is_active}
            onCheckedChange={(checked) => patch({ is_active: checked })}
          />
          <Label htmlFor="is_active">Empresa ativa</Label>
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
