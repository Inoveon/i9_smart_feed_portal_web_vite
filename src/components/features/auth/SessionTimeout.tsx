/**
 * COMPONENTE SESSION TIMEOUT - Aviso de sessão expirando
 * 
 * Funcionalidades:
 * - Monitora tempo de expiração do token
 * - Aviso 5 minutos antes de expirar
 * - Botão para renovar sessão
 * - Auto logout se não renovar
 * - Modal não intrusivo
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, RefreshCw, LogOut } from 'lucide-react'

import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'

interface SessionTimeoutProps {
  warningMinutes?: number // Minutos antes de expirar para mostrar aviso
  className?: string
}

export function SessionTimeout({ warningMinutes = 5, className = '' }: SessionTimeoutProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const { user, refreshAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    if (!user || !authService.isAuthenticated()) {
      setShowWarning(false)
      return
    }

    const checkTokenExpiration = () => {
      const token = authService.getToken()
      if (!token) return

      try {
        // Decodificar JWT para pegar tempo de expiração
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expirationTime = payload.exp * 1000 // Converter para ms
        const currentTime = Date.now()
        const timeUntilExpiration = expirationTime - currentTime
        const warningTime = warningMinutes * 60 * 1000 // Converter para ms

        if (timeUntilExpiration <= 0) {
          // Token já expirado
          handleExpired()
        } else if (timeUntilExpiration <= warningTime) {
          // Mostrar aviso
          setTimeLeft(Math.floor(timeUntilExpiration / 1000))
          setShowWarning(true)
        } else {
          // Token ainda válido
          setShowWarning(false)
          setTimeLeft(null)
        }
      } catch (error) {
        
      }
    }

    // Verificar inicialmente
    checkTokenExpiration()

    // Verificar a cada segundo quando mostrar aviso
    const interval = setInterval(checkTokenExpiration, 1000)

    return () => clearInterval(interval)
  }, [user, warningMinutes])

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleRefreshSession = async () => {
    setIsRefreshing(true)
    try {
      await refreshAuth()
      setShowWarning(false)
      setTimeLeft(null)
    } catch (error) {
      
      handleExpired()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExpired = () => {
    clearAuth()
    setShowWarning(false)
    setTimeLeft(null)
    // Redirecionar para login será tratado pelo AuthGuard
  }

  const handleLogout = () => {
    clearAuth()
    setShowWarning(false)
    setTimeLeft(null)
  }

  if (!showWarning || !timeLeft) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <Card className="w-80 border-warning">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-warning">
            <Clock className="h-4 w-4" />
            Sessão Expirando
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-warning/20 bg-warning/5">
            <AlertDescription className="text-sm">
              Sua sessão expira em <strong>{formatTimeLeft(timeLeft)}</strong>.
              <br />
              Renovar para continuar conectado?
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRefreshSession} 
              disabled={isRefreshing}
              className="w-full"
              size="sm"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Renovando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Renovar Sessão
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Fazer Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Hook para usar o SessionTimeout em qualquer lugar
 */
export function useSessionTimeout() {
  const [isNearExpiration, setIsNearExpiration] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user || !authService.isAuthenticated()) {
      setIsNearExpiration(false)
      return
    }

    const checkExpiration = () => {
      const token = authService.getToken()
      if (!token) return

      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expirationTime = payload.exp * 1000
        const currentTime = Date.now()
        const timeUntilExpiration = expirationTime - currentTime
        const warningTime = 5 * 60 * 1000 // 5 minutos

        setIsNearExpiration(timeUntilExpiration <= warningTime)
      } catch {
        setIsNearExpiration(false)
      }
    }

    checkExpiration()
    const interval = setInterval(checkExpiration, 30000) // Check a cada 30s

    return () => clearInterval(interval)
  }, [user])

  return { isNearExpiration }
}

/**
 * Versão compacta para usar na barra superior
 */
export function SessionTimeoutIndicator() {
  const { isNearExpiration } = useSessionTimeout()
  
  if (!isNearExpiration) return null

  return (
    <div className="flex items-center gap-2 text-xs text-warning">
      <Clock className="h-3 w-3 animate-pulse" />
      <span>Sessão expirando</span>
    </div>
  )
}

/**
 * EXEMPLO DE USO:
 * 
 * // No AppLayout ou App.tsx
 * function App() {
 *   return (
 *     <div>
 *       <Routes>...</Routes>
 *       <SessionTimeout /> // Modal automático
 *     </div>
 *   )
 * }
 * 
 * // Na barra superior
 * function Header() {
 *   return (
 *     <header>
 *       <nav>...</nav>
 *       <SessionTimeoutIndicator />
 *     </header>
 *   )
 * }
 * 
 * // Em componentes
 * function SomeComponent() {
 *   const { isNearExpiration } = useSessionTimeout()
 *   
 *   return (
 *     <div>
 *       {isNearExpiration && <Warning />}
 *       <Content />
 *     </div>
 *   )
 * }
 */
