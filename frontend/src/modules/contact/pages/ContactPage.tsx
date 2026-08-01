import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { contactApi } from '@/modules/contact/api/contact.api'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/shared/components/PhoneInput'

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company_name: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const patch = (partial: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...partial }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await contactApi.submit({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        company_name: form.company_name || null,
        message: form.message || null,
      })
      setSent(true)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível enviar seu contato. Tente novamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Recebemos seu contato!</h1>
        <p className="text-sm text-muted-foreground">
          Nosso time vai entrar em contato em breve para dar sequência ao seu cadastro.
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
        <h1 className="text-2xl font-semibold">Cadastre-se</h1>
        <p className="text-sm text-muted-foreground">
          Conte um pouco sobre sua empresa ou estabelecimento e nosso time entra em contato para
          finalizar o cadastro.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="Seu nome"
            required
          />
        </div>

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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <PhoneInput
              id="phone"
              value={form.phone}
              onChange={(phone) => patch({ phone })}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company_name">Empresa/estabelecimento</Label>
            <Input
              id="company_name"
              value={form.company_name}
              onChange={(e) => patch({ company_name: e.target.value })}
              placeholder="Nome (opcional)"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="message">Mensagem</Label>
          <Textarea
            id="message"
            value={form.message}
            onChange={(e) => patch({ message: e.target.value })}
            placeholder="Conte um pouco mais (opcional)"
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full cursor-pointer">
          {submitting ? 'Enviando…' : 'Enviar'}
        </Button>
        <Link to="/login" className="text-center text-sm text-muted-foreground hover:underline">
          Voltar para o login
        </Link>
      </form>
    </div>
  )
}
