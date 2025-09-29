import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthState, User, LoginCredentials } from '@/types/auth'
import { authService } from '@/services/auth.service'

/**
 * STORE DE AUTENTICAÇÃO USANDO ZUSTAND
 * 
 * Gerencia estado global de autenticação integrado com API real
 * - Persiste dados no localStorage
 * - Sincroniza com tokens JWT
 * - Integra com authService
 */
interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
  setUser: (user: User | null) => void
  clearAuth: () => void
  
  // Utilities
  getUser: () => User | null
  getUserRole: () => User['role'] | null
  hasRole: (role: User['role']) => boolean
  hasAnyRole: (roles: User['role'][]) => boolean
}

/**
 * Store de autenticação com persistência
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Realizar login
       */
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          // Fazer login via service
          await authService.login(credentials)
          
          // Obter dados do usuário do endpoint /api/auth/me
          const user = await authService.getCurrentUser()
          
          if (!user) {
            throw new Error('Não foi possível obter dados do usuário')
          }

          set({ 
            user,
            isAuthenticated: true, 
            isLoading: false,
            error: null
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false, 
            error: errorMessage 
          })
          throw error
        }
      },

      /**
       * Realizar logout
       */
      logout: async () => {
        set({ isLoading: true, error: null })
        
        try {
          await authService.logout()
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        } catch (error) {
          // Mesmo com erro, limpar estado local
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      /**
       * Verificar autenticação existente
       * Chamado na inicialização da app
       */
      checkAuth: async () => {
        set({ isLoading: true, error: null })
        
        try {
          if (!authService.isAuthenticated()) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
            return
          }

          // Verificar se token precisa ser renovado
          const token = authService.getToken()
          if (token && authService.isTokenExpired(token)) {
            // Tentar renovar token
            try {
              await authService.refreshToken()
            } catch {
              // Se falhar, fazer logout
              await authService.logout()
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
              })
              return
            }
          }

          // Obter dados do usuário do endpoint /api/auth/me
          const user = await authService.getCurrentUser()
          
          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro na verificação'
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage
          })
        }
      },

      /**
       * Renovar autenticação
       */
      refreshAuth: async () => {
        try {
          await authService.refreshToken()
          const user = await authService.getCurrentUser()
          
          if (user) {
            set({
              user,
              isAuthenticated: true,
              error: null
            })
          }
        } catch (error) {
          // Se falhar, fazer logout
          await get().logout()
          throw error
        }
      },

      /**
       * Limpar erro
       */
      clearError: () => {
        set({ error: null })
      },

      /**
       * Definir usuário
       */
      setUser: (user: User | null) => {
        set({ 
          user,
          isAuthenticated: user !== null,
          error: null
        })
      },

      /**
       * Limpar autenticação
       */
      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      },

      // =============================================================================
      // UTILITIES
      // =============================================================================

      /**
       * Obter usuário atual
       */
      getUser: () => {
        return get().user
      },

      /**
       * Obter role do usuário
       */
      getUserRole: () => {
        return get().user?.role || null
      },

      /**
       * Verificar se usuário tem role específica
       */
      hasRole: (role: User['role']) => {
        const userRole = get().user?.role
        return userRole === role
      },

      /**
       * Verificar se usuário tem qualquer uma das roles
       */
      hasAnyRole: (roles: User['role'][]) => {
        const userRole = get().user?.role
        return userRole ? roles.includes(userRole) : false
      },
    }),
    {
      name: 'i9-smart-auth-storage', // Nome único para o localStorage
      partialize: (state) => ({
        // Persistir apenas dados essenciais
        // Não persistir isLoading e error
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Após hidratar, verificar se auth ainda é válida
        if (state) {
          state.checkAuth()
        }
      },
    }
  )
)

// =============================================================================
// SELETORES PARA PERFORMANCE
// =============================================================================

/**
 * Seletores otimizados para evitar re-renders desnecessários
 */
export const authSelectors = {
  user: (state: AuthStore) => state.user,
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
  isLoading: (state: AuthStore) => state.isLoading,
  error: (state: AuthStore) => state.error,
  userRole: (state: AuthStore) => state.user?.role,
  isAdmin: (state: AuthStore) => state.user?.role === 'admin',
  isEditor: (state: AuthStore) => state.user?.role === 'editor',
  canEdit: (state: AuthStore) => state.user?.role === 'admin' || state.user?.role === 'editor',
}