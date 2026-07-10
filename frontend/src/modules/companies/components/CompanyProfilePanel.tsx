import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddressForm } from '@/modules/localization/components/AddressForm'
import type { AddressValue } from '@/modules/localization/types'
import { useCompanyProfile, useUpdateCompanyProfile } from '@/modules/companies/hooks/useCompany'
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
  const { data: profile, isLoading } = useCompanyProfile()

  if (isLoading || !profile) {
    return <p className="text-muted-foreground">Carregando perfil…</p>
  }

  return <CompanyProfileForm key={profile.id} profile={profile} />
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
  const [feedback, setFeedback] = useState<'ok' | 'error' | null>(null)

  const patch = (partial: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...partial }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFeedback(null)
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
      setFeedback('ok')
    } catch {
      setFeedback('error')
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
              <Label>E-mail de login</Label>
              <Input value={profile.login_email} disabled readOnly />
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
