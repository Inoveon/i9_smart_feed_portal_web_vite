import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: any }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidCatch(error: any) {
    // Silenciar logs em produção; exibir UI amigável
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary catched:', error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="p-4 border border-destructive rounded-md bg-destructive/10">
            <div className="font-semibold mb-1">Ocorreu um erro ao carregar esta página.</div>
            <div className="text-sm text-muted-foreground">Recarregue ou tente novamente mais tarde.</div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

