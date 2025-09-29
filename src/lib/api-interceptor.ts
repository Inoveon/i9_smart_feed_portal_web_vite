/**
 * INTERCEPTOR DE REQUISIÇÕES - i9 Smart Campaigns Portal
 * 
 * Funcionalidades:
 * - Adiciona token automaticamente em todas as requisições
 * - Intercepta 401 e tenta refresh token
 * - Redireciona para login se refresh falhar
 * - Logging de requisições em desenvolvimento
 * 
 * BASEADO NA API REAL - TESTADO ✅
 * - Login: POST /api/auth/login (form-urlencoded)
 * - Refresh: POST /api/auth/refresh (JSON)
 * - Me: GET /api/auth/me (Bearer token)
 */

import { authService } from '@/services/auth.service'

export interface ApiError extends Error {
  status?: number
  code?: string
}

class ApiInterceptor {
  private baseURL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:8000')
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null
  
  /**
   * Fazer requisição com interceptação automática
   */
  async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    
    // Preparar headers
    const headers = new Headers(options.headers)
    
    // Adicionar Content-Type se não especificado e tiver body
    if (options.body && !headers.get('Content-Type')) {
      if (typeof options.body === 'string') {
        try {
          JSON.parse(options.body)
          headers.set('Content-Type', 'application/json')
        } catch {
          // Se não for JSON válido, não adicionar Content-Type
        }
      } else if (options.body instanceof URLSearchParams) {
        headers.set('Content-Type', 'application/x-www-form-urlencoded')
      } else if (options.body instanceof FormData) {
        // Para FormData, não definir Content-Type (deixar o navegador definir com boundary)
      }
    }
    
    // Adicionar token de autorização se disponível
    const token = authService.getToken()
    if (token && !authService.isTokenExpired(token) && !headers.get('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    
    // Fazer requisição inicial
    let response = await this.makeRequest(fullUrl, {
      ...options,
      headers,
    })
    
    // Se receber 401, tentar refresh token
    if (response.status === 401 && token) {
      try {
        const newToken = await this.handleTokenRefresh()
        
        // Refazer requisição com novo token
        headers.set('Authorization', `Bearer ${newToken}`)
        response = await this.makeRequest(fullUrl, {
          ...options,
          headers,
        })
      } catch (refreshError) {
        // Se refresh falhar, fazer logout e redirecionar
        await authService.logout()
        this.redirectToLogin()
        throw this.createApiError('Session expired. Please login again.', 401)
      }
    }
    
    // Verificar se response foi bem-sucedida
    if (!response.ok) {
      const error = await this.parseErrorResponse(response)
      throw error
    }
    
    // Parse da resposta
    return this.parseSuccessResponse<T>(response)
  }
  
  /**
   * Fazer requisição HTTP com logging
   */
  private async makeRequest(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
    
    try {
      // Log em desenvolvimento
      if (import.meta.env.DEV) {
        
      }
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      
      // Log da resposta em desenvolvimento
      if (import.meta.env.DEV) {
        
      }
      
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createApiError('Request timeout', 408)
      }
      
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw this.createApiError('Network error. Please check your connection.', 0)
      }
      
      throw error
    }
  }
  
  /**
   * Gerenciar refresh token (evitar multiple refreshs simultâneos)
   */
  private async handleTokenRefresh(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      // Aguardar refresh já em andamento
      return this.refreshPromise
    }
    
    this.isRefreshing = true
    this.refreshPromise = authService.refreshToken()
    
    try {
      const newToken = await this.refreshPromise
      return newToken
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }
  
  /**
   * Parse de resposta de erro
   */
  private async parseErrorResponse(response: Response): Promise<ApiError> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    let errorCode = response.status.toString()
    
    try {
      const contentType = response.headers.get('Content-Type')
      
      if (contentType?.includes('application/json')) {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
        errorCode = errorData.code || errorCode
      } else {
        const textError = await response.text()
        if (textError) {
          errorMessage = textError
        }
      }
    } catch {
      // Se não conseguir fazer parse, usar mensagem padrão
    }
    
    return this.createApiError(errorMessage, response.status, errorCode)
  }
  
  /**
   * Parse de resposta de sucesso
   */
  private async parseSuccessResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('Content-Type')
    
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    
    if (response.status === 204) {
      return null as T
    }
    
    return response.text() as T
  }
  
  /**
   * Criar erro tipado
   */
  private createApiError(message: string, status?: number, code?: string): ApiError {
    const error = new Error(message) as ApiError
    error.status = status
    error.code = code
    return error
  }
  
  /**
   * Redirecionar para login
   */
  private redirectToLogin(): void {
    // Em desenvolvimento, apenas logar
    if (import.meta.env.DEV) {
      
    }
    
    // Limpar URL e redirecionar
    const loginUrl = '/auth/login'
    const currentUrl = window.location.pathname + window.location.search
    
    // Salvar URL atual para redirect após login (se não for já uma rota de auth)
    if (!currentUrl.startsWith('/auth/')) {
      localStorage.setItem('i9_smart_redirect_after_login', currentUrl)
    }
    
    window.location.href = loginUrl
  }
  
  /**
   * Métodos de conveniência para diferentes HTTP methods
   */
  async get<T>(url: string, options: Omit<RequestInit, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }
  
  async post<T>(url: string, data?: any, options: Omit<RequestInit, 'method' | 'body'> = {}): Promise<T> {
    const body = this.serializeBody(data)
    return this.request<T>(url, { ...options, method: 'POST', body })
  }
  
  async put<T>(url: string, data?: any, options: Omit<RequestInit, 'method' | 'body'> = {}): Promise<T> {
    const body = this.serializeBody(data)
    return this.request<T>(url, { ...options, method: 'PUT', body })
  }
  
  async patch<T>(url: string, data?: any, options: Omit<RequestInit, 'method' | 'body'> = {}): Promise<T> {
    const body = this.serializeBody(data)
    return this.request<T>(url, { ...options, method: 'PATCH', body })
  }
  
  async delete<T>(url: string, options: Omit<RequestInit, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }
  
  /**
   * Serializar dados para body da requisição
   */
  private serializeBody(data: any): string | FormData | URLSearchParams | undefined {
    if (!data) return undefined
    
    if (data instanceof FormData || data instanceof URLSearchParams) {
      return data
    }
    
    if (typeof data === 'string') {
      return data
    }
    
    // Para objetos, serializar como JSON
    return JSON.stringify(data)
  }
}

// =============================================================================
// INSTÂNCIA SINGLETON
// =============================================================================

export const apiClient = new ApiInterceptor()

// =============================================================================
// EXEMPLO DE USO
// =============================================================================

/*
// Usar em services:
import { apiClient } from '@/lib/api-interceptor'

// GET com auto token
const campaigns = await apiClient.get<Campaign[]>('/api/campaigns')

// POST com auto token e auto refresh se necessário
const newCampaign = await apiClient.post<Campaign>('/api/campaigns', {
  name: 'Nova Campanha',
  description: 'Descrição'
})

// Tratamento de erros
try {
  const data = await apiClient.get('/api/protected-resource')
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      // Usuário será automaticamente redirecionado para login
    } else if (error.status === 403) {
      // Sem permissão
    } else {
      // Outro erro de API
    }
  }
}
*/
