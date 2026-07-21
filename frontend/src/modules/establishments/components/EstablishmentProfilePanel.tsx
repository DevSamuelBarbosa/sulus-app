import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddressForm } from '@/modules/localization/components/AddressForm'
import type { AddressValue } from '@/modules/localization/types'
import { useCategories } from '@/modules/categories/hooks/useCategories'
import { useAuth } from '@/modules/auth/AuthContext'
import { MasterPasswordDialog } from '@/shared/components/MasterPasswordDialog'
import {
  useDeleteEstablishmentAccount,
  useEstablishmentProfile,
  useUpdateEstablishmentProfile,
  useUpdateEstablishmentSettings,
} from '@/modules/establishments/hooks/useEstablishment'
import type { EstablishmentProfile } from '@/modules/establishments/types'

function addressFromProfile(profile: EstablishmentProfile): AddressValue {
  return {
    cep: profile.cep ?? '',
    logradouro: profile.logradouro ?? '',
    numero: profile.numero ?? '',
    complemento: profile.complemento ?? '',
    bairro: profile.bairro ?? '',
    state_id: profile.city?.state_id ?? null,
    city_id: profile.city_id,
  }
}

export function EstablishmentProfilePanel() {
  const { user } = useAuth()
  const { data: profile, isLoading } = useEstablishmentProfile()

  if (isLoading || !profile) {
    return <p className="text-muted-foreground">Carregando perfil…</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <EstablishmentProfileForm key={profile.id} profile={profile} />
      {user?.tenant_role === 'master' && <EstablishmentSensitiveSettings profile={profile} />}
    </div>
  )
}

function EstablishmentProfileForm({ profile }: { profile: EstablishmentProfile }) {
  const { data: categories = [] } = useCategories()
  const updateProfile = useUpdateEstablishmentProfile()
  const [form, setForm] = useState({
    name: profile.name,
    category_id: profile.category_id,
    description: profile.description ?? '',
    phone: profile.phone ?? '',
  })
  const [address, setAddress] = useState<AddressValue>(() => addressFromProfile(profile))
  const [feedback, setFeedback] = useState<'ok' | 'error' | null>(null)

  const patch = (partial: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...partial }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFeedback(null)
    try {
      await updateProfile.mutateAsync({
        name: form.name,
        category_id: form.category_id,
        description: form.description || null,
        phone: form.phone || null,
        cep: address.cep || null,
        logradouro: address.logradouro || null,
        numero: address.numero || null,
        complemento: address.complemento || null,
        bairro: address.bairro || null,
        city_id: address.city_id,
      })
      setFeedback('ok')
    } catch {
      setFeedback('error')
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Dados do estabelecimento</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>CNPJ</Label>
              <Input value={profile.cnpj} disabled readOnly />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Responsável (Master)</Label>
              <Input value={profile.master?.email ?? '—'} disabled readOnly />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="Nome do estabelecimento"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={form.category_id ? String(form.category_id) : 'none'}
                onValueChange={(v) => patch({ category_id: v === 'none' ? null : Number(v) })}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Selecione…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => patch({ phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
              placeholder="Conte para os clientes o que encontram aqui — isso aparece na busca."
            />
          </div>

          <AddressForm value={address} onChange={setAddress} />

          {feedback === 'ok' && (
            <Alert>
              <AlertDescription>Perfil atualizado com sucesso.</AlertDescription>
            </Alert>
          )}
          {feedback === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>Não foi possível salvar. Confira os dados e tente novamente.</AlertDescription>
            </Alert>
          )}

          <div>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

/**
 * Only rendered for the tenant's Master (see EstablishmentProfilePanel
 * above) — CNPJ and account deletion always require the password to be
 * redigitated, even though the user is already logged in (see
 * MasterPasswordDialog).
 */
function EstablishmentSensitiveSettings({ profile }: { profile: EstablishmentProfile }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const updateSettings = useUpdateEstablishmentSettings()
  const deleteAccount = useDeleteEstablishmentAccount()
  const [cnpj, setCnpj] = useState(profile.cnpj)
  const [isActive, setIsActive] = useState(profile.is_active)
  const [cnpjDialogOpen, setCnpjDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <Card className="max-w-2xl border-destructive/30">
      <CardHeader>
        <CardTitle>Configurações avançadas</CardTitle>
        <CardDescription>Exclusivo do Master — cada ação pede sua senha novamente.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="e_settings_cnpj">CNPJ</Label>
              <Input
                id="e_settings_cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ''))}
                maxLength={14}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch id="e_settings_is_active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="e_settings_is_active">Estabelecimento ativo</Label>
            </div>
          </div>
          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCnpjDialogOpen(true)}
              disabled={cnpj === profile.cnpj && isActive === profile.is_active}
            >
              Salvar configurações
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Excluir a conta remove o estabelecimento da plataforma e desativa todos os logins vinculados.
          </p>
          <div>
            <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              Excluir conta
            </Button>
          </div>
        </div>
      </CardContent>

      <MasterPasswordDialog
        open={cnpjDialogOpen}
        onOpenChange={setCnpjDialogOpen}
        title="Salvar configurações"
        description="Confirme sua senha para alterar CNPJ/status do estabelecimento."
        onConfirm={async (password) => {
          await updateSettings.mutateAsync({ cnpj, is_active: isActive, password })
        }}
      />

      <MasterPasswordDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir conta do estabelecimento?"
        description="Essa ação não pode ser desfeita. Confirme sua senha para excluir."
        confirmLabel="Excluir conta"
        destructive
        onConfirm={async (password) => {
          await deleteAccount.mutateAsync(password)
          await logout()
          navigate('/login', { replace: true })
        }}
      />
    </Card>
  )
}
