import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckCircle2, Home, ScanLine } from 'lucide-react'
import { initials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getErrorMessage } from '@/shared/lib/errors'
import { QrScanner } from '@/modules/benefits/components/QrScanner'
import { useRegisterBenefitUsage, useValidateQrToken } from '@/modules/benefits/hooks/useBenefits'
import type { QrValidation } from '@/modules/qrcode/types'

type Step = 'scan' | 'confirm' | 'done'

export function ScanQrPage() {
  const [step, setStep] = useState<Step>('scan')
  const [manualToken, setManualToken] = useState('')
  const [validation, setValidation] = useState<QrValidation | null>(null)

  const validateToken = useValidateQrToken()
  const registerUsage = useRegisterBenefitUsage()

  const handleToken = useCallback(
    async (token: string) => {
      try {
        const result = await validateToken.mutateAsync(token)
        setValidation(result)
        setStep('confirm')
      } catch (err) {
        toast.error(getErrorMessage(err, 'Não foi possível validar o QR Code.'))
      }
    },
    [validateToken],
  )

  async function handleConfirm() {
    if (!validation) return
    try {
      await registerUsage.mutateAsync(validation.confirmation_ref)
      setStep('done')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível registrar a utilização.'))
    }
  }

  function reset() {
    setValidation(null)
    setManualToken('')
    setStep('scan')
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Validar benefício</h2>
        <p className="text-muted-foreground">Escaneie o QR Code do cliente para liberar o benefício.</p>
      </div>

      {step === 'scan' && (
        <Card>
          <CardHeader>
            <CardTitle>Escanear QR Code</CardTitle>
            <CardDescription>
              Aponte a câmera para o código do cliente ou digite o token manualmente.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <QrScanner active={step === 'scan'} onScan={handleToken} />

            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (manualToken.trim()) void handleToken(manualToken.trim())
              }}
            >
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="manual-token">Código manual</Label>
                <Input
                  id="manual-token"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Cole o token do cliente aqui"
                />
              </div>
              <Button type="submit" disabled={validateToken.isPending || !manualToken.trim()}>
                Validar
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && validation && (
        <Card>
          <CardHeader>
            <CardTitle>Confirme o cliente</CardTitle>
            <CardDescription>Confira a foto e o nome antes de liberar o benefício.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <Avatar className="size-24">
              <AvatarImage src={validation.employee.photo_url ?? undefined} />
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {initials(validation.employee.full_name)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-lg font-semibold">{validation.employee.full_name}</p>
              <p className="text-sm text-muted-foreground">{validation.employee.company_name}</p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={reset}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={() => void handleConfirm()} disabled={registerUsage.isPending}>
              Confirmar atendimento
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'done' && validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              Utilização registrada
            </CardTitle>
            <CardDescription>
              {validation.employee.full_name} usou o benefício com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={reset} className="gap-2">
              <ScanLine className="size-4" />
              Escanear outro
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/establishment">
                <Home className="size-4" />
                Voltar ao início
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
