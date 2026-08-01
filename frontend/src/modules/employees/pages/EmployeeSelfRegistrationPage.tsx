import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/modules/auth/AuthContext'
import { companyApi } from '@/modules/companies/api/company.api'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StateSelect } from '@/shared/components/StateSelect'
import { CityCombobox } from '@/shared/components/CityCombobox'
import { DocumentInput } from '@/shared/components/DocumentInput'
import { PhoneInput } from '@/shared/components/PhoneInput'

type LinkState = 'checking' | 'valid' | 'invalid'

export function EmployeeSelfRegistrationPage() {
  const { registerEmployee } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [linkState, setLinkState] = useState<LinkState>(() => (token ? 'checking' : 'invalid'))
  const [companyName, setCompanyName] = useState('')
  const [form, setForm] = useState({ email: '', full_name: '', document: '', phone: '' })
  const [stateId, setStateId] = useState<number | null>(null)
  const [cityId, setCityId] = useState<number | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const patch = (partial: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...partial }))

  useEffect(() => {
    if (!token) return
    companyApi.publicRegistration
      .show(token)
      .then((info) => {
        setCompanyName(info.trade_name)
        setLinkState('valid')
      })
      .catch(() => setLinkState('invalid'))
  }, [token])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    setSubmitting(true)
    try {
      await registerEmployee({
        token,
        email: form.email,
        full_name: form.full_name,
        document: form.document,
        phone: form.phone || null,
        city_id: cityId,
        password,
      })
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível concluir o cadastro. Confira os dados e tente novamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (linkState === 'checking') {
    return <p className="text-center text-sm text-muted-foreground">Verificando link…</p>
  }

  if (linkState === 'invalid') {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-semibold">Link inválido ou expirado</h1>
        <p className="text-sm text-muted-foreground">
          Peça para a sua empresa gerar um novo link de cadastro.
        </p>
        <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
          Voltar para o login
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Cadastre-se na {companyName}</h1>
        <p className="text-sm text-muted-foreground">Preencha seus dados para ativar o benefício.</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => patch({ email: e.target.value })}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input
            id="full_name"
            value={form.full_name}
            onChange={(e) => patch({ full_name: e.target.value })}
            placeholder="Nome completo"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="document">CPF/CNPJ</Label>
            <DocumentInput
              id="document"
              value={form.document}
              onChange={(document) => patch({ document })}
              placeholder="CPF ou CNPJ"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <PhoneInput
              id="phone"
              value={form.phone}
              onChange={(phone) => patch({ phone })}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employee-state">Estado</Label>
            <StateSelect
              id="employee-state"
              value={stateId}
              onChange={(next) => {
                setStateId(next)
                setCityId(null)
              }}
              placeholder="Opcional — home office"
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employee-city">Cidade</Label>
            <CityCombobox
              id="employee-city"
              stateId={stateId}
              value={cityId}
              onChange={setCityId}
              placeholder="Selecione…"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-password">Confirmar senha</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a senha"
            required
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full cursor-pointer">
          {submitting ? 'Cadastrando…' : 'Concluir cadastro'}
        </Button>
      </form>
    </div>
  )
}
