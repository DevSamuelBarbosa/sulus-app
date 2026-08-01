import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/modules/auth/api/auth.api'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível enviar o link. Tente novamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Verifique seu e-mail</h1>
        <p className="text-sm text-muted-foreground">
          Se o e-mail informado estiver cadastrado, você vai receber um link para redefinir sua
          senha em instantes.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">Voltar para o login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Recuperar senha</h1>
        <p className="text-sm text-muted-foreground">
          Informe seu e-mail e enviaremos um link para você redefinir sua senha.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full cursor-pointer">
          {submitting ? 'Enviando…' : 'Enviar link'}
        </Button>
        <Link to="/login" className="text-center text-sm text-muted-foreground hover:underline">
          Voltar para o login
        </Link>
      </form>
    </div>
  )
}
