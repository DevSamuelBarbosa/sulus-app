import { useTheme } from '@/app/theme-provider'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /**
   * Force the white-lettering variant regardless of the app's light/dark
   * preference — for surfaces that are always dark (e.g. the login panel),
   * as opposed to ones that flip with the theme toggle.
   */
  onDark?: boolean
}

/**
 * Full wordmark (mark + "Sulus Benefícios" lettering), theme-aware by
 * default: the lettering in `logo.png` is white (for a dark background),
 * `logo-dark.png`'s lettering is black (for a light background).
 */
export function LogoWordmark({ className, onDark }: LogoProps) {
  const { theme } = useTheme()
  const isDark = onDark ?? theme === 'dark'
  const src = isDark ? '/logo.png' : '/logo-dark.png'
  return (
    <img
      src={src}
      alt="Sulus Benefícios"
      // self-start: without it, a flex-col parent's default align-items
      // stretch forces this image to fill the container's width while
      // height stays at h-9, distorting the aspect ratio badly.
      className={cn('h-18 w-auto self-start', className)}
    />
  )
}

/**
 * Icon-only "S" mark. Has a transparent background and reads fine on any
 * surface (dark chrome or light page), so — unlike the wordmark — it isn't
 * theme-dependent.
 */
export function LogoMark({ className }: LogoProps) {
  return <img src="/favicon.png" alt="Sulus" className={cn('size-8', className)} />
}
