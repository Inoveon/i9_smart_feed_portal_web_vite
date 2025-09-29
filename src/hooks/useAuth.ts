import { useEffect, useCallback } from 'react'
import { useAuthStore, authSelectors } from '@/stores/auth.store'
import { User, LoginCredentials } from '@/types/auth'
import { useLogin, useLogout } from '@/services/auth.service'

/**
 * HOOK PERSONALIZADO DE AUTENTICAÇÃO
 * 
 * Centraliza toda lógica de autenticação e integra:
 * - Zustand Store
 * - Auth Service  
 * - React Query mutations
 * - Navegação automática
 */
export function useAuth() {
  // Selectors do store (otimizados para evitar re-renders)
  const user = useAuthStore(authSelectors.user)
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated)
  const isLoading = useAuthStore(authSelectors.isLoading)
  const error = useAuthStore(authSelectors.error)

  // Actions do store
  const checkAuth = useAuthStore((state) => state.checkAuth)
  const clearError = useAuthStore((state) => state.clearError)
  const refreshAuth = useAuthStore((state) => state.refreshAuth)

  // Mutations do React Query
  const loginMutation = useLogin()
  const logoutMutation = useLogout()

  // =============================================================================
  // HANDLERS
  // =============================================================================

  /**
   * Realizar logout
   */
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch (error) {
      // Mesmo com erro, auth já foi limpa
      console.warn('Erro no logout:', error)
    }
  }, [logoutMutation])

  // =============================================================================
  // EFEITOS
  // =============================================================================

  /**
   * Verificar autenticação ao montar o componente
   */
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  /**
   * Auto refresh token antes de expirar
   */
  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Verificar token a cada 5 minutos
    const interval = setInterval(async () => {
      try {
        await refreshAuth()
      } catch (error) {
        console.warn('Falha no auto refresh:', error)
        // Se falhar, fazer logout silencioso
        await logout()
      }
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [isAuthenticated, user, refreshAuth, logout])

  /**
   * Monitorar atividade do usuário para renovar sessão
   */
  useEffect(() => {
    if (!isAuthenticated) return

    let lastActivity = Date.now()

    const updateLastActivity = () => {
      lastActivity = Date.now()
    }

    // Eventos que indicam atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, true)
    })

    // Verificar inatividade a cada minuto
    const inactivityCheck = setInterval(async () => {
      const inactiveTime = Date.now() - lastActivity
      const fiveMinutes = 5 * 60 * 1000

      // Se usuário estiver ativo nos últimos 5 minutos, renovar token
      if (inactiveTime < fiveMinutes) {
        try {
          await refreshAuth()
        } catch (error) {
          console.warn('Falha no refresh por inatividade:', error)
        }
      }
    }, 60 * 1000) // 1 minuto

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateLastActivity, true)
      })
      clearInterval(inactivityCheck)
    }
  }, [isAuthenticated, refreshAuth])

  /**
   * Sincronização entre abas/janelas
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Se token foi removido em outra aba, fazer logout
      if (e.key === 'i9_smart_auth_token' && !e.newValue && e.oldValue) {
        logout()
      }
      
      // Se token foi adicionado em outra aba, verificar auth
      if (e.key === 'i9_smart_auth_token' && e.newValue && !e.oldValue) {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [logout, checkAuth])

  // =============================================================================
  // OUTROS HANDLERS
  // =============================================================================

  /**
   * Realizar login
   */
  const login = useCallback(async (credentials: LoginCredentials, remember?: boolean) => {
    try {
      clearError()
      
      // Usar mutation do React Query para login
      await loginMutation.mutateAsync({ credentials, remember })
      
      // Verificar auth após login bem-sucedido
      await checkAuth()
    } catch (error) {
      // Erro já é tratado pelo mutation e store
      throw error
    }
  }, [loginMutation, checkAuth, clearError])

  /**
   * Renovar token
   */
  const refresh = useCallback(async () => {
    try {
      await refreshAuth()
    } catch (error) {
      // Se refresh falhar, fazer logout
      await logout()
      throw error
    }
  }, [refreshAuth, logout])

  // =============================================================================
  // UTILITIES
  // =============================================================================

  /**
   * Verificar se usuário tem role específica
   */
  const hasRole = useCallback((role: User['role']): boolean => {
    return user?.role === role
  }, [user])

  /**
   * Verificar se usuário tem qualquer uma das roles
   */
  const hasAnyRole = useCallback((roles: User['role'][]): boolean => {
    return user?.role ? roles.includes(user.role) : false
  }, [user])

  /**
   * Verificar se é admin
   */
  const isAdmin = useCallback((): boolean => {
    return user?.role === 'admin'
  }, [user])

  /**
   * Verificar se pode editar
   */
  const canEdit = useCallback((): boolean => {
    return user?.role === 'admin' || user?.role === 'editor'
  }, [user])

  /**
   * Obter iniciais do usuário para avatar
   */
  const getUserInitials = useCallback((): string => {
    if (!user?.full_name) {
      return user?.username?.slice(0, 2).toUpperCase() || 'U'
    }
    
    const names = user.full_name.split(' ')
    if (names.length === 1) {
      return names[0].slice(0, 2).toUpperCase()
    }
    
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
  }, [user])

  // =============================================================================
  // ESTADO COMBINADO
  // =============================================================================

  const isLoginLoading = loginMutation.isPending
  const isLogoutLoading = logoutMutation.isPending
  const combinedLoading = isLoading || isLoginLoading || isLogoutLoading

  const combinedError = error || 
    (loginMutation.error?.message) || 
    (logoutMutation.error?.message) || 
    null

  // =============================================================================
  // RETORNO
  // =============================================================================

  return {
    // Estado
    user,
    isAuthenticated,
    isLoading: combinedLoading,
    error: combinedError,
    
    // Loading states específicos
    isLoginLoading,
    isLogoutLoading,
    isCheckingAuth: isLoading,

    // Actions
    login,
    logout,
    refresh,
    clearError,

    // Utilities
    hasRole,
    hasAnyRole,
    isAdmin,
    canEdit,
    getUserInitials,

    // Dados do usuário
    userRole: user?.role,
    userEmail: user?.email,
    userName: user?.full_name || user?.username,
  }
}

// =============================================================================
// HOOK PARA PROTEGER ROTAS
// =============================================================================

/**
 * Hook para proteger rotas baseado em roles
 */
export function useRequireAuth(requiredRoles?: User['role'][]) {
  const { isAuthenticated, hasAnyRole, isLoading } = useAuth()

  const canAccess = isAuthenticated && (
    !requiredRoles || 
    requiredRoles.length === 0 || 
    hasAnyRole(requiredRoles)
  )

  return {
    canAccess,
    isLoading,
    isAuthenticated,
    needsAuth: !isAuthenticated,
    needsRole: isAuthenticated && requiredRoles && !hasAnyRole(requiredRoles),
  }
}

// =============================================================================
// HOOK PARA REDIRECIONAMENTO AUTOMÁTICO
// =============================================================================

/**
 * Hook para redirecionamento baseado em autenticação
 */
export function useAuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth()

  /**
   * Verificar se deve redirecionar para login
   */
  const shouldRedirectToLogin = useCallback(() => {
    return !isLoading && !isAuthenticated
  }, [isLoading, isAuthenticated])

  /**
   * Verificar se deve redirecionar para dashboard
   */
  const shouldRedirectToDashboard = useCallback(() => {
    return !isLoading && isAuthenticated
  }, [isLoading, isAuthenticated])

  return {
    shouldRedirectToLogin,
    shouldRedirectToDashboard,
    isLoading,
  }
}
