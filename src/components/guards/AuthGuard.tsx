/**
 * AUTH GUARD - Proteção de rotas autenticadas
 * 
 * Funcionalidades:
 * - Verifica se usuário está autenticado
 * - Verifica validade do token
 * - Redireciona para login se necessário
 * - Loading state durante verificação
 * - Tenta renovar token automaticamente
 * 
 * USO:
 * <AuthGuard>
 *   <ProtectedComponent />
 * </AuthGuard>
 */

import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * Componente de loading para verificação de autenticação
 */
function AuthCheckingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-center space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AuthGuard({ 
  children, 
  fallback = <AuthCheckingLoading />,
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const location = useLocation()
  const [isInitialized, setIsInitialized] = useState(false)
  const { user, setUser, clearAuth } = useAuthStore()

  // Query para verificar usuário atual
  const { isLoading, refetch } = useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: authService.getCurrentUser,
    enabled: false, // Só executar manualmente
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificação inicial rápida
        if (!authService.isAuthenticated()) {
          clearAuth()
          setIsInitialized(true)
          return
        }

        // Verificar se já temos usuário no store
        if (user) {
          setIsInitialized(true)
          return
        }

        // Buscar dados do usuário
        const userData = await refetch()
        
        if (userData.data) {
          setUser(userData.data)
        } else {
          clearAuth()
        }
      } catch (error) {
        // Se o token for inválido, tentar refresh
        try {
          await authService.refreshToken()
          
          // Tentar novamente após refresh
          const userData = await refetch()
          if (userData.data) {
            setUser(userData.data)
          } else {
            throw new Error('Falha após refresh token')
          }
        } catch (refreshError) {
          clearAuth()
        }
      } finally {
        setIsInitialized(true)
      }
    }

    checkAuth()
  }, [user, setUser, clearAuth, refetch])

  // Mostrar loading durante inicialização
  if (!isInitialized || isLoading) {
    return fallback
  }

  // Se não estiver autenticado, redirecionar para login
  if (!user || !authService.isAuthenticated()) {
    
    // Salvar URL atual para redirect após login
    const returnUrl = location.pathname + location.search
    if (returnUrl !== redirectTo && !returnUrl.startsWith('/auth/')) {
      localStorage.setItem('i9_smart_redirect_after_login', returnUrl)
    }
    
    return <Navigate to={redirectTo} replace />
  }

  // Usuário autenticado - renderizar children
  return <>{children}</>
}

/**
 * Hook para usar dentro de componentes protegidos
 */
export function useAuthGuard() {
  const { user } = useAuthStore()
  const isAuthenticated = authService.isAuthenticated()
  
  return {
    user,
    isAuthenticated,
    isLoading: !user && isAuthenticated, // Loading se tem token mas não tem user
  }
}

/**
 * HOC para proteger componentes
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, 'children'>
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

/**
 * Exemplo de uso:
 * 
 * // Proteger rota
 * function ProtectedPage() {
 *   return (
 *     <AuthGuard>
 *       <Dashboard />
 *     </AuthGuard>
 *   )
 * }
 * 
 * // Usar hook dentro de componente protegido
 * function Dashboard() {
 *   const { user, isAuthenticated } = useAuthGuard()
 *   return <div>Welcome {user?.full_name}</div>
 * }
 * 
 * // Usar HOC
 * const ProtectedDashboard = withAuthGuard(Dashboard)
 */
