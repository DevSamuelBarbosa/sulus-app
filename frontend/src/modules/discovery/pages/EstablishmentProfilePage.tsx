import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone } from 'lucide-react'
import { initials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useEstablishmentProfile } from '@/modules/discovery/hooks/useDiscovery'

function formatAddress(establishment: NonNullable<ReturnType<typeof useEstablishmentProfile>['data']>): string | null {
  const parts = [
    establishment.logradouro && establishment.numero
      ? `${establishment.logradouro}, ${establishment.numero}`
      : establishment.logradouro,
    establishment.complemento,
    establishment.bairro,
    establishment.city ? `${establishment.city.name} — ${establishment.city.uf}` : null,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(', ') : null
}

export function EstablishmentProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: establishment, isLoading } = useEstablishmentProfile(Number(id))

  return (
    <section className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4" />
        Voltar
      </Button>

      {isLoading && <p className="text-center text-sm text-muted-foreground">Carregando…</p>}

      {establishment && (
        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <Avatar className="size-16">
              {establishment.logo_url && (
                <AvatarImage src={establishment.logo_url} alt={establishment.name} />
              )}
              <AvatarFallback className="bg-primary text-lg text-primary-foreground">
                {initials(establishment.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{establishment.name}</h2>
              {establishment.category && <Badge variant="secondary">{establishment.category.name}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {establishment.description && (
              <p className="text-sm text-muted-foreground">{establishment.description}</p>
            )}

            <div className="flex flex-col gap-2 text-sm">
              {establishment.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <span>{establishment.phone}</span>
                </div>
              )}
              {formatAddress(establishment) && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>{formatAddress(establishment)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
