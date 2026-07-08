import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * React has no default fallback UI — an uncaught render/effect error
 * anywhere in the tree unmounts the whole app to a blank white screen. This
 * catches that and shows a recoverable message instead.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-svh place-items-center gap-3 px-6 text-center">
          <p className="text-lg font-semibold">Algo deu errado.</p>
          <p className="text-sm text-muted-foreground">Recarregue a página para continuar.</p>
        </div>
      )
    }

    return this.props.children
  }
}
