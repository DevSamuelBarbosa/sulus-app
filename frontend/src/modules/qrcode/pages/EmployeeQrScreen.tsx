import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, CheckCircle2, Copy, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QrCodeImage } from '@/modules/qrcode/components/QrCodeImage'
import { useQrToken } from '@/modules/qrcode/hooks/useQrToken'
import { LogoMark } from '@/shared/components/Logo'

/**
 * Deliberately chrome-less (no DashboardLayout/sidebar): the employee mostly
 * opens this on a phone at a partner's counter and needs the code fast, with
 * nothing else competing for attention. See the QR-flow plan notes for why.
 */
export function EmployeeQrScreen() {
  const { token, secondsLeft, isLoading, error, status, regenerate } = useQrToken()
  const isUsed = status === 'used'
  const [copied, setCopied] = useState(false)

  function formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
  }

  async function handleCopy() {
    if (!token) return
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard permission denied — ignore, the text is still select-all
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center bg-tertiary px-6 py-6 text-tertiary-foreground">
      <div className="flex w-full max-w-sm items-center gap-2">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="text-tertiary-foreground hover:bg-white/10 hover:text-tertiary-foreground"
        >
          <Link to="/employee" aria-label="Voltar">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <LogoMark className="size-7" />
        <span className="text-lg font-semibold">
          <span className="text-primary">Sulus</span> Benefícios
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          {isUsed ? (
            <div className="grid h-[260px] w-[260px] place-items-center gap-3 px-4 text-center text-neutral-900">
              <CheckCircle2 className="size-14 text-primary" />
              <p className="font-semibold">Benefício utilizado!</p>
            </div>
          ) : error ? (
            <div className="grid h-[260px] w-[260px] place-items-center px-4 text-center text-sm text-destructive">
              {error}
            </div>
          ) : isLoading || !token ? (
            <div className="grid h-[260px] w-[260px] place-items-center text-sm text-muted-foreground">
              Gerando…
            </div>
          ) : (
            <QrCodeImage value={token} size={260} />
          )}
        </div>

        {!error && !isUsed && token && (
          <div className="flex w-full max-w-sm items-center gap-2 rounded-full bg-black/20 py-1.5 pr-1.5 pl-4">
            <span className="select-all truncate font-mono text-xs text-tertiary-foreground/70">
              {token}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-auto size-7 shrink-0 rounded-full text-tertiary-foreground hover:bg-white/10 hover:text-tertiary-foreground"
              onClick={() => void handleCopy()}
              aria-label="Copiar código"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </Button>
          </div>
        )}

        <p className="text-center text-sm text-tertiary-foreground/70">
          {isUsed
            ? 'Volte ao painel quando precisar usar o benefício novamente.'
            : error
              ? 'Toque em "gerar novo código" para tentar novamente.'
              : `Expira em ${formatCountdown(secondsLeft)} — atualiza automaticamente`}
        </p>

        {isUsed ? (
          <Button asChild size="lg" className="gap-2">
            <Link to="/employee">
              <Home className="size-4" />
              Voltar ao início
            </Link>
          </Button>
        ) : (
          <Button size="lg" onClick={() => void regenerate()} className="gap-2">
            <RefreshCw className="size-4" />
            Gerar novo código
          </Button>
        )}
      </div>

      <p className="pb-2 text-center text-xs text-tertiary-foreground/50">
        Mostre este código no balcão do estabelecimento parceiro.
      </p>
    </div>
  )
}
