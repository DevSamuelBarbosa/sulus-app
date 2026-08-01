import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getErrorMessage } from '@/shared/lib/errors'
import {
  useGenerateSelfRegistrationLink,
  useRevokeSelfRegistrationLink,
} from '@/modules/companies/hooks/useCompany'
import type { CompanyProfile } from '@/modules/companies/types'

function daysUntil(dateString: string): number {
  const diffMs = new Date(dateString).getTime() - Date.now()
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)))
}

export function CompanySelfRegistrationLinkPanel({ profile }: { profile: CompanyProfile }) {
  const generate = useGenerateSelfRegistrationLink()
  const revoke = useRevokeSelfRegistrationLink()
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    try {
      await generate.mutateAsync()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível gerar o link. Tente novamente.'))
    }
  }

  async function handleRevoke() {
    try {
      await revoke.mutateAsync()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível revogar o link. Tente novamente.'))
    }
  }

  async function handleCopy() {
    if (!profile.self_registration_link) return
    try {
      await navigator.clipboard.writeText(profile.self_registration_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard permission denied — ignore, the link is still select-all
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Link de cadastro de funcionários</CardTitle>
        <CardDescription>
          Compartilhe este link para que os próprios funcionários se cadastrem, já vinculados à
          empresa. Por segurança, ele expira em 7 dias.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {profile.self_registration_link ? (
          <>
            <div className="flex items-center gap-2">
              <Input value={profile.self_registration_link} readOnly className="select-all font-mono text-xs" />
              <Button type="button" variant="outline" size="icon" onClick={() => void handleCopy()}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
            {profile.self_registration_token_expires_at && (
              <p className="text-sm text-muted-foreground">
                Expira em {daysUntil(profile.self_registration_token_expires_at)} dia(s).
              </p>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" disabled={generate.isPending} onClick={handleGenerate}>
                {generate.isPending ? 'Gerando…' : 'Gerar novo link'}
              </Button>
              <Button type="button" variant="destructive" disabled={revoke.isPending} onClick={handleRevoke}>
                {revoke.isPending ? 'Revogando…' : 'Revogar'}
              </Button>
            </div>
          </>
        ) : (
          <div>
            <Button type="button" disabled={generate.isPending} onClick={handleGenerate}>
              {generate.isPending ? 'Gerando…' : 'Gerar link de cadastro'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
