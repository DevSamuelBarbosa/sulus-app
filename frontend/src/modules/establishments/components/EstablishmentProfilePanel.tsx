import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  useEstablishmentProfile,
  useUpdateEstablishmentProfile,
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
  const { data: profile, isLoading } = useEstablishmentProfile()

  if (isLoading || !profile) {
    return <p className="text-muted-foreground">Carregando perfil…</p>
  }

  return <EstablishmentProfileForm key={profile.id} profile={profile} />
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
              <Label>E-mail de login</Label>
              <Input value={profile.login_email} disabled readOnly />
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
