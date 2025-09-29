import { ReactNode } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export function DataTableShell({
  isLoading,
  error,
  itemsLength,
  children,
  onRetry,
}: {
  isLoading: boolean
  error?: Error | null
  itemsLength: number
  children: ReactNode
  onRetry?: () => void
}) {
  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground py-4">Carregando...</div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados: {error.message}
          </AlertDescription>
        </Alert>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>Tentar novamente</Button>
        )}
      </div>
    )
  }

  if (itemsLength === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">Nenhum registro encontrado</div>
    )
  }

  return <>{children}</>
}

