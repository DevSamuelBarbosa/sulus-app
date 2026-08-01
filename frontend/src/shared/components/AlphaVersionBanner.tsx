import { useAuth } from '@/modules/auth/AuthContext'

/** Shown to every non-admin role — companies, establishments, and employees
 * are the ones actually testing the product day-to-day in this phase. */
export function AlphaVersionBanner() {
  const { user } = useAuth()

  if (!user || user.role === 'admin') {
    return null
  }

  return (
    <div className="bg-blue-500/15 px-4 py-2 text-center text-sm text-blue-900 dark:bg-blue-400/10 dark:text-blue-200">
      Versão Alpha — a plataforma ainda está em fase de testes e pode passar por instabilidades.
    </div>
  )
}
