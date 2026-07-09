import { Link } from 'react-router-dom'
import { initials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { EstablishmentSummary } from '@/modules/discovery/types'

interface EstablishmentCardProps {
  establishment: EstablishmentSummary
  to: string
}

export function EstablishmentCard({ establishment, to }: EstablishmentCardProps) {
  return (
    <Link to={to}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex gap-3">
          <Avatar className="size-12">
            {establishment.logo_url && (
              <AvatarImage src={establishment.logo_url} alt={establishment.name} />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials(establishment.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-medium">{establishment.name}</p>
              {establishment.category && (
                <Badge variant="secondary" className="shrink-0">
                  {establishment.category.name}
                </Badge>
              )}
            </div>

            {establishment.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {establishment.description}
              </p>
            )}

            {establishment.city && (
              <p className="text-xs text-muted-foreground">
                {establishment.city.name} — {establishment.city.uf}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
