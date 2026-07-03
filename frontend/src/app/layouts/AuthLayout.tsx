import { Outlet } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function AuthLayout() {
  return (
    <div className="grid min-h-svh place-items-center bg-muted p-4">
      <Card className="w-full max-w-sm border-tertiary/10 shadow-lg">
        <CardHeader>
          <h1 className="text-xl font-semibold text-tertiary">Sulus Benefícios</h1>
        </CardHeader>
        <CardContent>
          <Outlet />
        </CardContent>
      </Card>
    </div>
  )
}
