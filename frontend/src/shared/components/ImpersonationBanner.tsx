import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { Button } from '@/components/ui/button'

export function ImpersonationBanner() {
  const { user, stopImpersonation } = useAuth()
  const navigate = useNavigate()

  if (!user?.impersonated_by) {
    return null
  }

  async function handleStop() {
    await stopImpersonation()
    navigate('/admin')
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-500/15 px-4 py-2 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
      <span>
        Você está impersonando <strong>{user.name}</strong>
      </span>
      <Button variant="outline" size="sm" onClick={() => void handleStop()}>
        Sair
      </Button>
    </div>
  )
}
