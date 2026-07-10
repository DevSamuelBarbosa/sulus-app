import { Outlet } from 'react-router-dom'
import { LogoWordmark } from '@/shared/components/Logo'

/**
 * Split screen: a form panel (always dark, independent of the app's
 * light/dark preference — see the `dark` class below) and a full-bleed
 * photo panel with a headline. The photo panel is dropped below `lg` since
 * there isn't room for it alongside a usable form on smaller screens.
 *
 * The `dark` class forces every themed color token (text, borders, inputs)
 * to their dark-mode values for this subtree, regardless of the user's
 * actual light/dark preference — matching the panel's fixed near-black
 * background. Without it, a "light" global theme would render near-black
 * text on this near-black panel.
 */
export function AuthLayout() {
  return (
    <div className="dark flex min-h-svh bg-tertiary text-tertiary-foreground">
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-110 lg:shrink-0 xl:w-120">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
          <LogoWordmark onDark />
          <Outlet />
        </div>
      </div>

      <div className="relative hidden flex-1 lg:block">
        <img
          src="/tela-login.png"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/10 to-black/40" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-12">
          <span className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur">
            Gestão de benefícios
          </span>
          <h2 className="max-w-md text-3xl font-semibold text-white">
            Conecte empresas, funcionários e estabelecimentos parceiros.
          </h2>
          <p className="max-w-md text-white/70">
            QR Code, validação no balcão e histórico de utilização em um único painel.
          </p>
        </div>
      </div>
    </div>
  )
}
