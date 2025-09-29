/**
 * SERVICE PARA MÉTRICAS E DASHBOARD
 * 
 * Conecta com endpoints de métricas da API i9 Smart Campaigns
 * Baseado na documentação oficial: docs/API-DOCUMENTATION.md
 */

import { z } from 'zod'

// =============================================================================
// 1. SCHEMAS DE VALIDAÇÃO (baseados na API real)
// =============================================================================

// Schema para métricas do dashboard
const DashboardMetricsSchema = z.object({
  overview: z.object({
    total_campaigns: z.number(),
    total_active: z.number(),
    total_images: z.number(),
    total_users: z.number(),
  }),
  campaigns_by_type: z.object({
    global: z.number(),
    specific: z.number(),
  }),
  recent_activity: z.object({
    last_7_days: z.number(),
    last_30_days: z.number(),
  }),
  top_priority_campaigns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    priority: z.number(),
    status: z.string().optional(), // Campo opcional - API pode não retornar
    stations_count: z.union([z.string(), z.number()]).optional(), // Pode ser 'global' ou número
  })).optional(),
})

// Schema para visualizações
const ViewsMetricsSchema = z.object({
  timestamp: z.string(),
  views: z.object({
    total_today: z.number().optional(),
    total_this_hour: z.number().optional(),
    total_last_7_days: z.number().optional(),
    average_per_hour: z.number().optional(),
    active_campaigns: z.number().optional(),
    total: z.number().optional(), // Para período específico
    by_hour: z.array(z.unknown()).optional(),
    by_campaign: z.array(z.unknown()).optional(),
    by_station: z.array(z.unknown()).optional(),
  }),
  period: z.string().optional(),
})

// Schema para atividade (atualizado conforme API real)
const ActivityMetricsSchema = z.object({
  timestamp: z.string(),
  period: z.object({
    start: z.string(),
    end: z.string(),
    days: z.number(),
  }),
  campaigns_activity: z.array(z.object({
    date: z.string(),
    campaigns_created: z.number(),
  })),
  images_activity: z.array(z.object({
    date: z.string(),
    images_uploaded: z.number(),
  })),
  status_distribution: z.object({
    active: z.number(),
    scheduled: z.number().optional(),
    paused: z.number().optional(),
    expired: z.number().optional(),
  }),
  daily: z.array(z.object({
    date: z.string(),
    campaigns_created: z.number(),
    images_uploaded: z.number(),
  })).optional(),
})

// Schema para métricas de estações (corrigido e funcionando)
const StationsMetricsSchema = z.object({
  timestamp: z.string(),
  stations: z.array(z.object({
    station_id: z.string(),
    station_name: z.string(),
    campaigns_count: z.number(),
    campaigns: z.array(z.object({
      id: z.string(),
      name: z.string(),
      priority: z.number(),
    })),
  })),
  top_stations: z.array(z.object({
    station_id: z.string(),
    station_name: z.string(),
    campaigns_count: z.number(),
    campaigns: z.array(z.object({
      id: z.string(),
      name: z.string(),
      priority: z.number(),
    })),
  })),
  coverage: z.object({
    total_stations: z.number(),
    stations_with_campaigns: z.number(),
    percentage: z.number(),
    by_region: z.record(z.object({
      total: z.number(),
      with_campaigns: z.number(),
      percentage: z.number(),
    })),
  }),
})

// Schema para Analytics Dashboard
const AnalyticsSchema = z.object({
  timestamp: z.string(),
  kpis: z.object({
    total_campaigns: z.number(),
    active_campaigns: z.number(),
    total_images: z.number(),
    average_priority: z.number(),
    coverage_percentage: z.number(),
  }),
  trends: z.object({
    campaigns: z.object({
      current_period: z.number(),
      previous_period: z.number(),
      change_percentage: z.number(),
    }),
    images: z.object({
      current_period: z.number(),
      previous_period: z.number(),
      change_percentage: z.number(),
    }),
  }),
  comparisons: z.object({
    by_status: z.record(z.number()),
    by_region: z.record(z.number()),
  }),
  top_performers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    priority: z.number(),
    station_coverage: z.union([z.string(), z.number()]),
  })),
})

// Schema para métricas de campanha específica
const CampaignMetricsSchema = z.object({
  campaign: z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
    priority: z.number(),
  }),
  metadata: z.object({
    created_at: z.string(),
    updated_at: z.string(),
    created_by: z.string().nullable(),
  }),
  content: z.object({
    images_count: z.number(),
    total_duration: z.number(),
    average_display_time: z.number(),
  }),
  reach: z.object({
    target_type: z.string(),
    stations_count: z.union([z.string(), z.number()]),
    regions: z.array(z.string()),
    branches: z.array(z.string()),
    specific_stations: z.array(z.string()),
  }),
  duration: z.object({
    start_date: z.string().nullable(),
    end_date: z.string().nullable(),
    days_active: z.number(),
    days_remaining: z.number().nullable(),
  }),
  estimated_performance: z.object({
    daily_impressions: z.string(),
    total_impressions: z.string(),
    engagement_rate: z.string(),
  }),
})

// =============================================================================
// 2. TYPES
// =============================================================================

export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>
export type ViewsMetrics = z.infer<typeof ViewsMetricsSchema>
export type ActivityMetrics = z.infer<typeof ActivityMetricsSchema>
export type StationsMetrics = z.infer<typeof StationsMetricsSchema>
export type Analytics = z.infer<typeof AnalyticsSchema>
export type CampaignMetrics = z.infer<typeof CampaignMetricsSchema>

// =============================================================================
// 3. CLASSE DE SERVIÇO
// =============================================================================

class MetricsService {
  private baseURL = '' // Usar URLs relativas - nginx fará proxy para API
  
  /**
   * Método auxiliar para fazer requisições
   */
  private async request<T>(endpoint: string): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
    
    
    
    try {
      const token = localStorage.getItem('i9_smart_auth_token')
      
      const url = `${this.baseURL}/api${endpoint}`
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      
      
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        
        let error
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { message: errorText || `HTTP ${response.status}: ${response.statusText}` }
        }
        
        throw new Error(error.message || error.detail || `Request failed: ${response.status}`)
      }
      
      const data = await response.json()
      return data
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
  // MÉTODOS DE MÉTRICAS
  // =============================================================================
  
  /**
   * Buscar métricas gerais do dashboard
   * GET /api/metrics/dashboard
   */
  async getDashboard(): Promise<DashboardMetrics> {
    const response = await this.request<DashboardMetrics>('/metrics/dashboard')
    
    // Log dos dados brutos antes da validação
    
    
    try {
      return DashboardMetricsSchema.parse(response)
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Buscar visualizações totais ou por período
   * GET /api/metrics/views
   * GET /api/metrics/views/today
   * GET /api/metrics/views/week  
   * GET /api/metrics/views/month
   */
  async getViews(period?: 'today' | 'week' | 'month'): Promise<ViewsMetrics> {
    const endpoint = period ? `/metrics/views/${period}` : '/metrics/views'
    const response = await this.request<ViewsMetrics>(endpoint)
    return ViewsMetricsSchema.parse(response)
  }
  
  /**
   * Buscar atividade dos últimos N dias
   * GET /api/metrics/activity?days=7
   */
  async getActivity(days: number = 7): Promise<ActivityMetrics> {
    const response = await this.request<ActivityMetrics>(`/metrics/activity?days=${days}`)
    return ActivityMetricsSchema.parse(response)
  }
  
  /**
   * Buscar métricas de estações
   * GET /api/metrics/stations
   */
  async getStations(): Promise<StationsMetrics> {
    const response = await this.request<StationsMetrics>('/metrics/stations')
    return StationsMetricsSchema.parse(response)
  }
  
  /**
   * Buscar analytics completo
   * GET /api/analytics
   */
  async getAnalytics(): Promise<Analytics> {
    const response = await this.request<Analytics>('/analytics')
    return AnalyticsSchema.parse(response)
  }
  
  /**
   * Buscar métricas de uma campanha específica
   * GET /api/campaigns/{id}/metrics
   */
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    const response = await this.request<CampaignMetrics>(`/campaigns/${campaignId}/metrics`)
    return CampaignMetricsSchema.parse(response)
  }
  
  /**
   * Exportar relatórios
   * GET /api/reports/export
   */
  async exportReport(format: 'csv' | 'json' = 'json', filters?: Record<string, any>) {
    const params = new URLSearchParams({ format, ...filters })
    const response = await this.request<any>(`/reports/export?${params}`)
    return response
  }
}

// =============================================================================
// 4. EXPORTAR INSTÂNCIA ÚNICA
// =============================================================================

export const metricsService = new MetricsService()

// =============================================================================
// 5. HOOKS CUSTOMIZADOS PARA REACT QUERY
// =============================================================================

import { useQuery } from '@tanstack/react-query'

/**
 * Hook para métricas do dashboard
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['metrics', 'dashboard'],
    queryFn: () => metricsService.getDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch a cada 5 minutos
  })
}

/**
 * Hook para visualizações
 */
export function useViewsMetrics(period?: 'today' | 'week' | 'month') {
  return useQuery({
    queryKey: ['metrics', 'views', period],
    queryFn: () => metricsService.getViews(period),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchInterval: 2 * 60 * 1000, // Refetch a cada 2 minutos
  })
}

/**
 * Hook para atividade
 */
export function useActivityMetrics(days: number = 7) {
  return useQuery({
    queryKey: ['metrics', 'activity', days],
    queryFn: () => metricsService.getActivity(days),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para métricas de estações
 */
export function useStationsMetrics() {
  return useQuery({
    queryKey: ['metrics', 'stations'],
    queryFn: () => metricsService.getStations(),
    staleTime: 3 * 60 * 1000, // 3 minutos
  })
}

/**
 * Hook para analytics completo
 */
export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => metricsService.getAnalytics(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

/**
 * Hook para métricas de campanha específica
 */
export function useCampaignMetrics(campaignId: string) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'metrics'],
    queryFn: () => metricsService.getCampaignMetrics(campaignId),
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
