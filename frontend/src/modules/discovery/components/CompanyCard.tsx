import { initials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import type { CompanySummary } from '@/modules/discovery/types'

interface CompanyCardProps {
  company: CompanySummary
}

export function CompanyCard({ company }: CompanyCardProps) {
  const displayName = company.trade_name ?? company.legal_name

  return (
    <Card className="h-full">
      <CardContent className="flex gap-3">
        <Avatar className="size-12">
          {company.logo_url && <AvatarImage src={company.logo_url} alt={displayName} />}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials(displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate font-medium">{displayName}</p>
          {company.trade_name && (
            <p className="truncate text-xs text-muted-foreground">{company.legal_name}</p>
          )}
          {company.phone && <p className="text-sm text-muted-foreground">{company.phone}</p>}
          {company.city && (
            <p className="text-xs text-muted-foreground">
              {company.city.name} — {company.city.uf}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
