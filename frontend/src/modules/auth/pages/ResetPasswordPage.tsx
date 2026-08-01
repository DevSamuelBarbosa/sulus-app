import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { authApi } from '@/modules/auth/api/auth.api'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expired, setExpired] = useState(!token)

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
      await authApi.resetPassword(token, password)
      toast.success('Senha redefinida com sucesso. Faça login com a nova senha.')
      navigate('/login', { replace: true })
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 410) {
        setExpired(true)
      } else {
        toast.error(getErrorMessage(err, 'Não foi possível redefinir sua senha. Tente novamente.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (expired) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-semibold">Link inválido ou expirado</h1>
        <p className="text-sm text-muted-foreground">
          Peça um novo link de redefinição de senha.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link to="/recuperar-senha">Recuperar senha</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Redefinir senha</h1>
        <p className="text-sm text-muted-foreground">Escolha uma nova senha para sua conta.</p>
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
          {submitting ? 'Redefinindo…' : 'Redefinir senha'}
        </Button>
      </form>
    </div>
  )
}
