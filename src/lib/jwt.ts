import { JWTPayload } from '@/types/auth'

/**
 * Utilitário para decodificar JWT sem verificação
 * ATENÇÃO: Apenas para extrair dados do payload, não para validação de segurança
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (error) {
    console.warn('Erro ao decodificar JWT:', error)
    return null
  }
}

/**
 * Verifica se um token JWT está expirado
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return true
  }

  return Date.now() >= payload.exp * 1000
}

/**
 * Extrai informações do usuário do JWT
 */
export function getUserFromToken(token: string) {
  const payload = decodeJWT(token)
  if (!payload) {
    return null
  }

  return {
    email: payload.sub,
    role: payload.role,
  }
}