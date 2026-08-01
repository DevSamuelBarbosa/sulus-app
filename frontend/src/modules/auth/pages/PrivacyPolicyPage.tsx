import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-semibold">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground">
          Este texto ainda está em elaboração — a versão final vai detalhar exatamente quais
          dados coletamos, como usamos e por quanto tempo guardamos.
        </p>
      </div>

      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <p>
          A Sulus Benefícios está em fase Alpha e a plataforma coleta apenas os dados necessários
          para o funcionamento do benefício: dados cadastrais de empresas, estabelecimentos e
          funcionários (como nome, e-mail, telefone e CPF/CNPJ) e o histórico de utilizações do
          benefício.
        </p>
        <p>
          Enquanto a política definitiva não é publicada, qualquer dúvida sobre como seus dados
          são usados pode ser esclarecida diretamente com a gente.
        </p>
      </div>

      <Button asChild variant="outline" className="w-full">
        <Link to="/login">Voltar para o login</Link>
      </Button>
    </div>
  )
}
