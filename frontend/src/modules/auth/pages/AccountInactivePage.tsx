import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function AccountInactivePage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-lg font-semibold text-tertiary">Conta desativada</h2>
      <p className="text-sm text-muted-foreground">
        O acesso desta conta foi desativado pelo administrador da plataforma. Entre em contato com a
        equipe da Sulus para entender o motivo e saber como reativar seu acesso.
      </p>
      <Button asChild variant="outline" className="w-full">
        <Link to="/login">Voltar para o login</Link>
      </Button>
    </div>
  )
}
