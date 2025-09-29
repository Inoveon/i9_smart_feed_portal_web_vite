/**
 * COMPONENTE DE ERRO PARA DASHBOARD
 * 
 * Exibe erros de forma amigável com opção de retry
 * Usa componentes Alert do Shadcn
 */

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorAlertProps {
  error: Error | string
  onRetry?: () => void
  title?: string
  description?: string
}

export function ErrorAlert({ 
  error, 
  onRetry, 
  title = "Erro ao carregar dados",
  description 
}: ErrorAlertProps) {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <Card className="border-destructive/50">
      <CardContent className="pt-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="mt-2">
            {description || errorMessage}
          </AlertDescription>
          
          {onRetry && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          )}
        </Alert>
      </CardContent>
    </Card>
  )
}

/**
 * Componente específico para erro no dashboard
 */
export function DashboardError({ 
  error, 
  onRetry 
}: { 
  error: Error | string
  onRetry?: () => void 
}) {
  return (
    <div className="p-6">
      <ErrorAlert
        error={error}
        onRetry={onRetry}
        title="Erro no Dashboard"
        description="Não foi possível carregar as informações do dashboard. Verifique sua conexão e tente novamente."
      />
    </div>
  )
}