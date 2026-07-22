import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { useAuth } from '@/modules/auth/AuthContext'
import { employeeApi } from '@/modules/employees/api/employee.api'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type LinkState = 'checking' | 'valid' | 'invalid'

export function ActivateAccountPage() {
  const { activateAccount } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [linkState, setLinkState] = useState<LinkState>(() => (token ? 'checking' : 'invalid'))
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return
    employeeApi.activation
      .show(token)
      .then((info) => {
        setName(info.name)
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
      await activateAccount(token, password)
      navigate('/', { replace: true })
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 410) {
        setLinkState('invalid')
      } else {
        toast.error(getErrorMessage(err, 'Não foi possível ativar sua conta. Tente novamente.'))
      }
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
          Peça para a empresa reenviar o convite de ativação, ou fale com quem te cadastrou.
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
        <h1 className="text-2xl font-semibold">Olá, {name}!</h1>
        <p className="text-sm text-muted-foreground">Defina sua senha para ativar o acesso.</p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Nova senha</Label>
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
          {submitting ? 'Ativando…' : 'Ativar conta'}
        </Button>
      </form>
    </div>
  )
}
