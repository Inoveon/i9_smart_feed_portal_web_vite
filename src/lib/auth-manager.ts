/**
 * Gerenciador de Autenticação
 * 
 * Centraliza a lógica de renovação de token e mantém a sessão ativa
 * Previne logout inesperado renovando o token antes de expirar
 */

import { authService } from '@/services/auth.service'
import { decodeJWT } from '@/lib/jwt'

class AuthManager {
  private refreshTimer: ReturnType<typeof setTimeout> | null = null
  private isRefreshing = false
  private refreshPromise: Promise<void> | null = null
  
  /**
   * Inicia o gerenciamento de autenticação
   */
  start() {
    this.scheduleTokenRefresh()
    this.setupVisibilityHandler()
    this.setupInterceptors()
  }
  
  /**
   * Para o gerenciamento de autenticação
   */
  stop() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }
  
  /**
   * Agenda a renovação do token baseado em sua expiração
   */
  private scheduleTokenRefresh() {
    // Limpar timer anterior
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
    
    const token = authService.getToken()
    if (!token) {
      console.log('[AuthManager] Sem token, pulando agendamento')
      return
    }
    
    const payload = decodeJWT(token)
    if (!payload || !payload.exp) {
      console.log('[AuthManager] Token inválido, pulando agendamento')
      return
    }
    
    // Calcular tempo até expiração
    const now = Date.now()
    const expiry = payload.exp * 1000
    const timeUntilExpiry = expiry - now
    
    // Renovar quando faltar 20% do tempo ou 2 minutos (o que for maior)
    const refreshBuffer = Math.max(
      timeUntilExpiry * 0.2, // 20% do tempo restante
      2 * 60 * 1000 // 2 minutos
    )
    
    const timeUntilRefresh = timeUntilExpiry - refreshBuffer
    
    if (timeUntilRefresh <= 0) {
      // Token prestes a expirar, renovar imediatamente
      console.log('[AuthManager] Token expirando, renovando imediatamente')
      this.refreshToken()
    } else {
      // Agendar renovação
      const minutesUntilRefresh = Math.round(timeUntilRefresh / 60000)
      console.log(`[AuthManager] Agendando renovação de token em ${minutesUntilRefresh} minutos`)
      
      this.refreshTimer = setTimeout(() => {
        this.refreshToken()
      }, timeUntilRefresh)
    }
  }
  
  /**
   * Renova o token de autenticação
   */
  private async refreshToken() {
    // Se não tem token, não tentar renovar
    const token = authService.getToken()
    if (!token) {
      console.log('[AuthManager] Sem token, cancelando renovação')
      return
    }
    
    // Evitar múltiplas renovações simultâneas
    if (this.isRefreshing) {
      console.log('[AuthManager] Já renovando token, aguardando...')
      return this.refreshPromise
    }
    
    this.isRefreshing = true
    console.log('[AuthManager] Iniciando renovação de token')
    
    this.refreshPromise = authService.refreshToken()
      .then(() => {
        console.log('[AuthManager] Token renovado com sucesso')
        // Reagendar próxima renovação
        this.scheduleTokenRefresh()
      })
      .catch((error) => {
        console.error('[AuthManager] Falha ao renovar token:', error)
        
        // Se falhar, tentar novamente em 30 segundos
        // mas apenas se ainda tivermos um token válido
        const token = authService.getToken()
        if (token && !authService.isTokenExpired(token)) {
          console.log('[AuthManager] Tentando novamente em 30 segundos...')
          setTimeout(() => {
            this.refreshToken()
          }, 30000)
        } else {
          console.log('[AuthManager] Token expirado, usuário precisa fazer login')
          // Token expirou, o sistema de auth vai redirecionar para login
        }
      })
      .finally(() => {
        this.isRefreshing = false
      })
    
    return this.refreshPromise
  }
  
  /**
   * Configura handler para quando a aba volta a ficar visível
   * Útil para renovar token quando usuário volta de outra aba
   */
  private setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('[AuthManager] Aba ficou visível, verificando token')
        
        const token = authService.getToken()
        if (!token) return
        
        const payload = decodeJWT(token)
        if (!payload || !payload.exp) return
        
        const now = Date.now()
        const expiry = payload.exp * 1000
        const timeUntilExpiry = expiry - now
        
        // Se faltam menos de 5 minutos, renovar imediatamente
        if (timeUntilExpiry < 5 * 60 * 1000) {
          console.log('[AuthManager] Token expirando em breve, renovando...')
          this.refreshToken()
        } else {
          // Reagendar renovação
          this.scheduleTokenRefresh()
        }
      }
    })
  }
  
  /**
   * Configura interceptors para renovar token em respostas 401
   */
  private setupInterceptors() {
    // Interceptar respostas 401 globalmente
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const response = await originalFetch(...args)
      
      // Se receber 401 e não for endpoint de auth
      if (response.status === 401) {
        const url = typeof args[0] === 'string' ? args[0] : args[0].toString()
        const isAuthEndpoint = url?.includes('/auth/login') || url?.includes('/auth/refresh')
        
        if (!isAuthEndpoint && !this.isRefreshing) {
          console.log('[AuthManager] Recebido 401, tentando renovar token')
          
          // Tentar renovar token
          try {
            await this.refreshToken()
            // Repetir request original com novo token
            const token = authService.getToken()
            if (token && args[1]) {
              args[1].headers = {
                ...args[1].headers,
                'Authorization': `Bearer ${token}`
              }
            }
            return originalFetch(...args)
          } catch {
            // Se falhar, deixar o 401 passar para o sistema de auth tratar
          }
        }
      }
      
      return response
    }
  }
}

// Exportar instância única
export const authManager = new AuthManager()