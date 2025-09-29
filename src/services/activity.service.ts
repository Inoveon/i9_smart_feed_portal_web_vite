/**
 * SERVICE PARA ATIVIDADES DO SISTEMA
 * 
 * Conecta com endpoints de atividade da API i9 Smart Campaigns
 * Baseado na documentação oficial: docs/API-DOCUMENTATION.md
 */

import { z } from 'zod'

// =============================================================================
// 1. SCHEMAS DE VALIDAÇÃO (baseados na API real)
// =============================================================================

// Schema para usuário em atividade
const ActivityUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  full_name: z.string().optional(),
})

// Schema para atividade individual
const ActivitySchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string().optional(),
  user: ActivityUserSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.string(),
})

// Schema para feed de atividades
const ActivityFeedSchema = z.object({
  activities: z.array(ActivitySchema),
  pagination: z.object({
    page: z.number(),
    total: z.number(),
    total_pages: z.number().optional(),
    per_page: z.number().optional(),
  }),
})

// Schema para resumo de auditoria
const AuditSummarySchema = z.object({
  period: z.object({
    start: z.string(),
    end: z.string(),
  }),
  summary: z.object({
    campaigns_created: z.number(),
    campaigns_updated: z.number(),
    campaigns_deleted: z.number(),
    images_uploaded: z.number(),
    active_users: z.number(),
    total_activities: z.number(),
  }),
})

// =============================================================================
// 2. TYPES
// =============================================================================

export type Activity = z.infer<typeof ActivitySchema>
export type ActivityUser = z.infer<typeof ActivityUserSchema>
export type ActivityFeed = z.infer<typeof ActivityFeedSchema>
export type AuditSummary = z.infer<typeof AuditSummarySchema>

// =============================================================================
// 3. CLASSE DE SERVIÇO
// =============================================================================

class ActivityService {
  private baseURL = '' // Usar URLs relativas - nginx fará proxy para API
  
  /**
   * Método auxiliar para fazer requisições
   */
  private async request<T>(endpoint: string): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    
    try {
      const token = localStorage.getItem('i9_smart_auth_token')
      
      const response = await fetch(`${this.baseURL}/api${endpoint}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
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
  
  // =============================================================================
  // MÉTODOS DE ATIVIDADE
  // =============================================================================
  
  /**
   * Buscar feed de atividades do sistema
   * GET /api/activity/feed?page=1&limit=10
   */
  async getFeed(page: number = 1, limit: number = 10): Promise<ActivityFeed> {
    const response = await this.request<ActivityFeed>(
      `/activity/feed?page=${page}&limit=${limit}`
    )
    return ActivityFeedSchema.parse(response)
  }
  
  /**
   * Buscar resumo de auditoria (apenas admins)
   * GET /api/activity/audit/summary
   */
  async getAuditSummary(): Promise<AuditSummary> {
    const response = await this.request<AuditSummary>('/activity/audit/summary')
    return AuditSummarySchema.parse(response)
  }
}

// =============================================================================
// 4. EXPORTAR INSTÂNCIA ÚNICA
// =============================================================================

export const activityService = new ActivityService()

// =============================================================================
// 5. HOOKS CUSTOMIZADOS PARA REACT QUERY
// =============================================================================

import { useQuery } from '@tanstack/react-query'

/**
 * Hook para feed de atividades
 */
export function useActivityFeed(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['activity', 'feed', page, limit],
    queryFn: () => activityService.getFeed(page, limit),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 2 * 60 * 1000, // Refetch a cada 2 minutos
  })
}

/**
 * Hook para resumo de auditoria (apenas admins)
 */
export function useAuditSummary() {
  return useQuery({
    queryKey: ['activity', 'audit', 'summary'],
    queryFn: () => activityService.getAuditSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para atividades recentes (últimas 5)
 */
export function useRecentActivities() {
  return useQuery({
    queryKey: ['activity', 'recent'],
    queryFn: () => activityService.getFeed(1, 5),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch a cada 1 minuto
    select: (data) => data.activities, // Retorna apenas o array de atividades
  })
}