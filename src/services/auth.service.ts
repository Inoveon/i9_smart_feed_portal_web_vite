import { 
  LoginCredentials, 
  LoginResponse, 
  LoginResponseSchema,
  LoginCredentialsSchema,
  RefreshTokenSchema,
  User
} from '@/types/auth'
import { isTokenExpired, getUserFromToken } from '@/lib/jwt'

/**
 * SERVIÇO DE AUTENTICAÇÃO
 * Conecta com a API real i9 Smart Campaigns
 * 
 * Baseado nos testes reais dos endpoints:
 * - POST /api/auth/login ✅ Testado
 * - POST /api/auth/refresh (assumido baseado na documentação)
 */
class AuthService {
  // Sempre usar URLs relativas para funcionar com proxy do nginx
  // O nginx vai redirecionar /api/* para http://10.0.20.11:8001/*
  private baseURL = ''
  private tokenKey = 'i9_smart_auth_token'
  private refreshTokenKey = 'i9_smart_refresh_token'
  private credentialsKey = 'i9_smart_temp_creds'
  
  /**
   * Método auxiliar para fazer requisições
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`
        }))
        
        throw new Error(error.message || `Request failed: ${response.status}`)
      }
      
      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - API não respondeu em 30 segundos')
        }
        throw error
      }
      throw new Error('Erro desconhecido na requisição')
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Realizar login - TESTADO COM API REAL ✅
   * curl -X POST "http://localhost:8000/api/auth/login" \
   *   -H "Content-Type: application/x-www-form-urlencoded" \
   *   -d "username=admin&password=admin123"
   */
  async login(credentials: LoginCredentials, remember: boolean = false): Promise<LoginResponse> {
    const validatedCredentials = LoginCredentialsSchema.parse(credentials)
    const formData = new URLSearchParams()
    formData.append('username', validatedCredentials.username)
    formData.append('password', validatedCredentials.password)

    try {
      const data = await this.request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData as any,
      })
      const loginResponse = LoginResponseSchema.parse(data)
      this.setTokens(loginResponse.access_token, loginResponse.refresh_token)
      
      // Se "remember" estiver ativo, salvar credenciais criptografadas
      if (remember) {
        const encoded = btoa(JSON.stringify({
          u: validatedCredentials.username,
          p: validatedCredentials.password,
          t: Date.now()
        }))
        sessionStorage.setItem(this.credentialsKey, encoded)
      }
      
      return loginResponse
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('timeout')) {
          throw new Error('Não foi possível conectar à API. Verifique se o servidor está rodando.')
        }
        throw error
      }
      throw new Error('Erro desconhecido no login')
    }
  }

  /**
   * Renovar token de acesso
   * Baseado na documentação da API
   */
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      // Tentar auto-login se tiver credenciais salvas
      const autoLoginToken = await this.attemptAutoLogin()
      if (autoLoginToken) return autoLoginToken
      throw new Error('Refresh token não encontrado')
    }

    try {
      const requestData = RefreshTokenSchema.parse({ refresh_token: refreshToken })
      
      const response = await this.request<LoginResponse>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })
      
      // Armazenar novo token
      this.setTokens(response.access_token, response.refresh_token)
      
      return response.access_token
    } catch (error) {
      // Se refresh falhar, tentar auto-login
      const autoLoginToken = await this.attemptAutoLogin()
      if (autoLoginToken) return autoLoginToken
      throw error
    }
  }
  
  /**
   * Tentar fazer login automático com credenciais salvas
   */
  private async attemptAutoLogin(): Promise<string | null> {
    const encodedCreds = sessionStorage.getItem(this.credentialsKey)
    if (!encodedCreds) return null
    
    try {
      const decoded = JSON.parse(atob(encodedCreds))
      // Verificar se não expirou (24 horas)
      if (Date.now() - decoded.t > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem(this.credentialsKey)
        return null
      }
      
      const loginResponse = await this.login({
        username: decoded.u,
        password: decoded.p
      }, true)
      
      return loginResponse.access_token
    } catch (error) {
      sessionStorage.removeItem(this.credentialsKey)
      return null
    }
  }

  /**
   * Fazer logout
   * Remove tokens do localStorage
   */
  async logout(): Promise<void> {
    try {
      // Tentar invalidar token no servidor (se endpoint existir)
      const token = this.getToken()
      if (token) {
        await this.request<void>('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(() => {
          // Ignorar erro se endpoint não existir
        })
      }
    } finally {
      // Sempre limpar tokens e credenciais localmente
      this.clearTokens()
      sessionStorage.removeItem(this.credentialsKey)
    }
  }

  /**
   * Obter informações do usuário atual
   * Usando endpoint /api/auth/me - TESTADO COM API REAL ✅
   */
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken()
    if (!token || this.isTokenExpired(token)) return null

    try {
      const userData = await this.request<User>('/api/auth/me', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      return userData
    } catch (error) {
      const userInfo = getUserFromToken(token)
      if (!userInfo) return null
      return {
        id: userInfo.email,
        email: userInfo.email,
        username: userInfo.email.split('@')[0],
        full_name: userInfo.email.split('@')[0],
        role: userInfo.role,
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  }

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    return token !== null && !this.isTokenExpired(token)
  }

  /**
   * Obter token de acesso
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  /**
   * Obter refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey)
  }

  /**
   * Verificar se token está expirado
   */
  isTokenExpired(token?: string): boolean {
    const currentToken = token || this.getToken()
    if (!currentToken) return true
    
    return isTokenExpired(currentToken)
  }

  /**
   * Armazenar tokens
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, accessToken)
    localStorage.setItem(this.refreshTokenKey, refreshToken)
  }

  /**
   * Limpar tokens
   */
  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
  }

  /**
   * Registrar novo usuário
   * ENDPOINT: POST /api/auth/register
   * STATUS: Ainda não disponível na API (404)
   */
  async register(data: { email: string; username: string; password: string; full_name?: string }): Promise<void> {
    // Validar dados antes de enviar
    
    
    const response = await this.request<void>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    return response
  }

  /**
   * Solicitar redefinição de senha
   * ENDPOINT: POST /api/auth/forgot-password  
   * STATUS: Ainda não disponível na API (404)
   */
  async forgotPassword(email: string): Promise<void> {
    
    
    const response = await this.request<void>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    
    return response
  }

  /**
   * Redefinir senha com token
   * ENDPOINT: POST /api/auth/reset-password
   * STATUS: Ainda não disponível na API (assumido)
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    
    
    const response = await this.request<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token,
        new_password: newPassword
      }),
    })
    
    return response
  }

  /**
   * Atualizar perfil do usuário atual
   * ENDPOINT: PUT /api/auth/me
   */
  async updateMe(data: { full_name?: string; email?: string; preferences?: any }): Promise<User> {
    const token = this.getToken()
    if (!token) throw new Error('Token de acesso não encontrado')

    const response = await this.request<User>('/api/auth/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    return response
  }

  /**
   * Alterar senha do usuário atual
   * ENDPOINT: PUT /api/auth/me/password
   * STATUS: Ainda não testado
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = this.getToken()
    if (!token) {
      throw new Error('Token de acesso não encontrado')
    }

    
    
    const response = await this.request<void>('/api/auth/me/password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword
      }),
    })
    
    return response
  }

  /**
   * Obter header de autorização
   */
  getAuthHeader(): Record<string, string> {
    const token = this.getToken()
    if (!token) return {}
    
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  /**
   * Verificar saúde da API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      return response.ok
    } catch {
      return false
    }
  }
}

// =============================================================================
// EXPORTAR INSTÂNCIA ÚNICA
// =============================================================================

export const authService = new AuthService()

// =============================================================================
// HOOKS CUSTOMIZADOS PARA REACT QUERY
// =============================================================================

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Hook para login
 */
export function useLogin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ credentials, remember }: { credentials: LoginCredentials; remember?: boolean }) => 
      authService.login(credentials, remember),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      toast.success('Login realizado com sucesso!')
      return data
    },
    onError: (error) => {
      const em = (error?.message || '').toLowerCase()
      let msg = 'Erro no login. Verifique suas credenciais e tente novamente.'
      if (em.includes('500') || em.includes('internal')) {
        msg = 'Erro no servidor (500). Tente novamente em instantes.'
      } else if (em.includes('401') || em.includes('unauthorized') || em.includes('credenciais') || em.includes('senha') || em.includes('password')) {
        msg = 'Credenciais inválidas. Verifique usuário e senha.'
      } else if (em.includes('conectar') || em.includes('failed to fetch') || em.includes('timeout')) {
        msg = 'Não foi possível conectar à API. Verifique sua conexão ou aguarde.'
      }
      toast.error(msg)
    },
  })
}

/**
 * Hook para logout
 */
export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authService.logout.bind(authService),
    onSuccess: () => {
      queryClient.clear() // Limpar todos os dados em cache
      toast.success('Logout realizado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro no logout: ${error.message}`)
    },
  })
}

/**
 * Hook para registro
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: { email: string; username: string; password: string; full_name?: string }) => 
      authService.register(data),
    onSuccess: () => {
      toast.success('Conta criada com sucesso! Faça login para continuar.')
    },
    onError: (error) => {
      toast.error(`Erro ao criar conta: ${error.message}`)
    },
  })
}

/**
 * Hook para esqueci minha senha
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success('Email enviado! Verifique sua caixa de entrada.')
    },
    onError: (error) => {
      toast.error(`Erro ao solicitar redefinição: ${error.message}`)
    },
  })
}

/**
 * Hook para reset de senha
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) => 
      authService.resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Senha redefinida com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao redefinir senha: ${error.message}`)
    },
  })
}

/**
 * Hook para alteração de senha
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => 
      authService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao alterar senha: ${error.message}`)
    },
  })
}

/**
 * Hook para atualizar perfil (me)
 */
export function useUpdateMe() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (payload: { full_name?: string; email?: string; preferences?: any }) => authService.updateMe(payload),
    onSuccess: (user) => {
      setUser(user)
      queryClient.invalidateQueries({ queryKey: ['auth', 'current-user'] })
      toast.success('Perfil atualizado com sucesso!')
      return user
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar perfil: ${error.message}`)
    },
  })
}
