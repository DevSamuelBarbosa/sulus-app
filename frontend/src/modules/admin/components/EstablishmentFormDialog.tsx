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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { useCreateEstablishment, useUpdateEstablishment } from '@/modules/admin/hooks/useAdmin'
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
  const { data: categories = [] } = useCategories()
  const [profile, setProfile] = useState({
    user_name: '',
    email: establishment?.login_email ?? '',
    password: '',
    name: establishment?.name ?? '',
    cnpj: establishment?.cnpj ?? '',
    category_id: establishment?.category_id ?? (null as number | null),
    description: establishment?.description ?? '',
    phone: establishment?.phone ?? '',
    is_active: establishment?.is_active ?? true,
  })
  const [address, setAddress] = useState<AddressValue>(() => addressFromEstablishment(establishment))
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
          user_name: profile.user_name,
          email: profile.email,
          password: profile.password,
          name: profile.name,
          cnpj: profile.cnpj,
          category_id: profile.category_id,
          description: profile.description || null,
          phone: profile.phone || null,
          is_active: profile.is_active,
          ...addressPayload,
        })
      }
      onSaved()
    } catch {
      setError('Não foi possível salvar o estabelecimento. Confira os dados e tente novamente.')
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
            : 'Cria o usuário de login e o perfil do estabelecimento parceiro.'}
        </DialogDescription>
      </DialogHeader>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {!isEdit && (
          <>
            <FormSection title="Acesso" description="Credenciais de login do responsável pelo estabelecimento.">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="e_user_name">Nome do responsável (login)</Label>
                <Input
                  id="e_user_name"
                  value={profile.user_name}
                  onChange={(e) => patch({ user_name: e.target.value })}
                  placeholder="Nome do responsável"
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="e_email">E-mail de login</Label>
                  <Input
                    id="e_email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => patch({ email: e.target.value })}
                    placeholder="email@estabelecimento.com"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="e_password">Senha</Label>
                  <Input
                    id="e_password"
                    type="password"
                    value={profile.password}
                    onChange={(e) => patch({ password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    required
                  />
                </div>
              </div>
            </FormSection>
            <Separator />
          </>
        )}

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
