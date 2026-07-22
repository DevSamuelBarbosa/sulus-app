import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AddressForm } from '@/modules/localization/components/AddressForm'
import type { AddressValue } from '@/modules/localization/types'
import { useAuth } from '@/modules/auth/AuthContext'
import { getErrorMessage } from '@/shared/lib/errors'
import { MasterPasswordDialog } from '@/shared/components/MasterPasswordDialog'
import {
  useCompanyProfile,
  useDeleteCompanyAccount,
  useUpdateCompanyProfile,
  useUpdateCompanySettings,
} from '@/modules/companies/hooks/useCompany'
import type { CompanyProfile } from '@/modules/companies/types'

function addressFromProfile(profile: CompanyProfile): AddressValue {
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

export function CompanyProfilePanel() {
  const { user } = useAuth()
  const { data: profile, isLoading } = useCompanyProfile()

  if (isLoading || !profile) {
    return <p className="text-muted-foreground">Carregando perfil…</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <CompanyProfileForm key={profile.id} profile={profile} />
      {user?.tenant_role === 'master' && <CompanySensitiveSettings profile={profile} />}
    </div>
  )
}

function CompanyProfileForm({ profile }: { profile: CompanyProfile }) {
  const updateProfile = useUpdateCompanyProfile()
  const [form, setForm] = useState({
    legal_name: profile.legal_name,
    trade_name: profile.trade_name ?? '',
    phone: profile.phone ?? '',
    contact_email: profile.contact_email ?? '',
  })
  const [address, setAddress] = useState<AddressValue>(() => addressFromProfile(profile))
  const [saved, setSaved] = useState(false)

  const patch = (partial: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...partial }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaved(false)
    try {
      await updateProfile.mutateAsync({
        legal_name: form.legal_name,
        trade_name: form.trade_name || null,
        phone: form.phone || null,
        contact_email: form.contact_email || null,
        cep: address.cep || null,
        logradouro: address.logradouro || null,
        numero: address.numero || null,
        complemento: address.complemento || null,
        bairro: address.bairro || null,
        city_id: address.city_id,
      })
      setSaved(true)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar. Confira os dados e tente novamente.'))
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Dados da empresa</CardTitle>
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
            <Label htmlFor="legal_name">Razão social</Label>
            <Input
              id="legal_name"
              value={form.legal_name}
              onChange={(e) => patch({ legal_name: e.target.value })}
              placeholder="Razão social da empresa"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trade_name">Nome fantasia</Label>
              <Input
                id="trade_name"
                value={form.trade_name}
                onChange={(e) => patch({ trade_name: e.target.value })}
                placeholder="Nome fantasia (opcional)"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => patch({ phone: e.target.value })}
                placeholder="(00) 0000-0000"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contact_email">E-mail de contato</Label>
            <Input
              id="contact_email"
              type="email"
              value={form.contact_email}
              onChange={(e) => patch({ contact_email: e.target.value })}
              placeholder="contato@empresa.com"
            />
          </div>

          <AddressForm value={address} onChange={setAddress} />

          {saved && (
            <Alert>
              <AlertDescription>Perfil atualizado com sucesso.</AlertDescription>
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
 * Only rendered for the tenant's Master (see CompanyProfilePanel above) —
 * CNPJ and account deletion always require the password to be redigitated,
 * even though the user is already logged in (see MasterPasswordDialog).
 */
function CompanySensitiveSettings({ profile }: { profile: CompanyProfile }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const updateSettings = useUpdateCompanySettings()
  const deleteAccount = useDeleteCompanyAccount()
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
              <Label htmlFor="settings_cnpj">CNPJ</Label>
              <Input
                id="settings_cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value.replace(/\D/g, ''))}
                maxLength={14}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch id="settings_is_active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="settings_is_active">Empresa ativa</Label>
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
            Excluir a conta remove a empresa da plataforma e desativa todos os logins vinculados.
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
        description="Confirme sua senha para alterar CNPJ/status da empresa."
        onConfirm={async (password) => {
          await updateSettings.mutateAsync({ cnpj, is_active: isActive, password })
        }}
      />

      <MasterPasswordDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir conta da empresa?"
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
