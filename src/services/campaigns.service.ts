/**
 * SERVICE PARA CAMPANHAS
 * 
 * Conecta com endpoints de campanhas da API i9 Smart Campaigns
 * Baseado na documentação oficial: docs/API-DOCUMENTATION.md
 */

import { z } from 'zod'

// =============================================================================
// 1. SCHEMAS DE VALIDAÇÃO (baseados na API real)
// =============================================================================

// Schema para imagem de campanha
const CampaignImageSchema = z.object({
  id: z.string(),
  campaign_id: z.string().optional().nullable(),
  filename: z.string(),
  original_filename: z.string().optional().nullable(),
  url: z.string(),
  order: z.number(),
  display_time: z.number().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  active: z.boolean().optional(),
  size_bytes: z.number().optional().nullable(),
  mime_type: z.string().optional().nullable(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// Schema para campanha
const CampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(['active', 'scheduled', 'paused', 'expired']).optional(), // API pode não retornar em /campaigns/active
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  default_display_time: z.number(),
  // Targeting hierárquico — manter opcional por retrocompatibilidade
  regions: z.array(z.string()).nullable().optional(),
  branches: z.array(z.string()).nullable().optional(),
  stations: z.array(z.string()).nullable().optional(), // API pode retornar vazio/ausente/null
  priority: z.number(),
  is_deleted: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().nullable().optional(),
  images: z.array(CampaignImageSchema).optional(),
})

// Schema para criar nova campanha
const CreateCampaignSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['active', 'scheduled', 'paused']).default('active'),
  start_date: z.string(),
  end_date: z.string(),
  default_display_time: z.number().min(1000).max(60000).default(5000),
  // Arrays opcionais para evitar 422 em APIs antigas
  regions: z.array(z.string()).optional(),
  branches: z.array(z.string()).optional(),
  stations: z.array(z.string()).optional(),
  priority: z.number().min(0).max(100).default(0),
})

// Schema para atualizar campanha
const UpdateCampaignSchema = CreateCampaignSchema.partial()

// Schema para resposta de campanhas ativas
const ActiveCampaignsSchema = z.object({
  station_id: z.string().optional(),
  campaigns: z.array(CampaignSchema),
  total: z.number().optional(),
  timestamp: z.string(),
})

// =============================================================================
// 2. TYPES
// =============================================================================

export type Campaign = z.infer<typeof CampaignSchema>
export type CampaignImage = z.infer<typeof CampaignImageSchema>
export type CreateCampaignDTO = z.infer<typeof CreateCampaignSchema>
export type UpdateCampaignDTO = z.infer<typeof UpdateCampaignSchema>
export type ActiveCampaigns = z.infer<typeof ActiveCampaignsSchema>

export type CampaignListParams = {
  page?: number
  limit?: number
  search?: string
  status?: string
  region?: string
  sort?: string
  order?: 'asc' | 'desc'
}

// =============================================================================
// 3. CLASSE DE SERVIÇO
// =============================================================================

class CampaignsService {
  private baseURL = '' // Usar URLs relativas - nginx fará proxy para API
  
  /**
   * Método auxiliar para fazer requisições
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    
    try {
      const token = localStorage.getItem('i9_smart_auth_token')
      
      const response = await fetch(`${this.baseURL}/api${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
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
  
  // =============================================================================
  // MÉTODOS DE CAMPANHAS
  // =============================================================================
  
  /**
   * Buscar todas as campanhas
   * GET /api/campaigns/
   */
  async getAll(): Promise<Campaign[]> {
    const response = await this.request<Campaign[]>('/campaigns/')
    return z.array(CampaignSchema).parse(response)
  }
  
  /**
   * Buscar campanhas com paginação
   * GET /api/campaigns/
   */
  async list(params: CampaignListParams = {}): Promise<{ items: Campaign[]; page: number; page_size: number; total: number; total_pages: number }> {
    try {
      // Por enquanto, usar o getAll e fazer paginação no cliente
      // Quando a API tiver suporte a paginação, podemos ajustar
      const allCampaigns = await this.getAll()
      
      // Aplicar filtros
      let filteredItems = [...allCampaigns]
      
      // Filtro de busca
      if (params.search) {
        const searchLower = params.search.toLowerCase()
        filteredItems = filteredItems.filter(item => 
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
        )
      }
      
      // Filtro de status
      if (params.status) {
        filteredItems = filteredItems.filter(item => item.status === params.status)
      }
      
      // Ordenação
      if (params.sort) {
        filteredItems.sort((a, b) => {
          const aVal = (a as any)[params.sort!]
          const bVal = (b as any)[params.sort!]
          const order = params.order === 'desc' ? -1 : 1
          return aVal > bVal ? order : aVal < bVal ? -order : 0
        })
      }
      
      // Paginação
      const page = params.page || 1
      const limit = params.limit || 12
      const start = (page - 1) * limit
      const end = start + limit
      const paginatedItems = filteredItems.slice(start, end)
      
      return {
        items: paginatedItems,
        page,
        page_size: limit,
        total: filteredItems.length,
        total_pages: Math.ceil(filteredItems.length / limit)
      }
    } catch (error) {
      // Se falhar, retornar lista vazia
      console.error('Erro ao listar campanhas:', error)
      return {
        items: [],
        page: params.page || 1,
        page_size: params.limit || 12,
        total: 0,
        total_pages: 0
      }
    }
  }
  
  /**
   * Buscar campanha por ID
   * GET /api/campaigns/{id}
   */
  async getById(id: string): Promise<Campaign> {
    const response = await this.request<Campaign>(`/campaigns/${id}`)
    
    // Buscar imagens separadamente já que vêm de outro endpoint
    try {
      const imagesResponse = await this.request<any>(`/campaigns/${id}/images`)
      if (imagesResponse && imagesResponse.images) {
        // Manter URLs relativas para funcionar com Gateway
        response.images = imagesResponse.images
      }
    } catch {
      // Se falhar, continuar sem imagens
      response.images = []
    }
    
    return CampaignSchema.parse(response)
  }
  
  /**
   * Buscar campanhas ativas (com cache)
   * GET /api/campaigns/active
   */
  async getActive(): Promise<ActiveCampaigns> {
    const response = await this.request<ActiveCampaigns>('/campaigns/active')
    
    // Dados recebidos da API
    
    try {
      return ActiveCampaignsSchema.parse(response)
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Buscar campanhas ativas por estação
   * GET /api/campaigns/active/{station_id}
   */
  async getActiveByStation(stationId: string): Promise<ActiveCampaigns> {
    const response = await this.request<ActiveCampaigns>(`/campaigns/active/${stationId}`)
    return ActiveCampaignsSchema.parse(response)
  }
  
  /**
   * Criar nova campanha
   * POST /api/campaigns/
   */
  async create(data: CreateCampaignDTO): Promise<Campaign> {
    const validatedData = CreateCampaignSchema.parse(data)
    // Enviar apenas campos presentes para evitar rejeição por campos desconhecidos
    const body: Record<string, any> = {
      name: validatedData.name,
      description: validatedData.description,
      status: validatedData.status,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date,
      default_display_time: validatedData.default_display_time,
      priority: validatedData.priority,
    }
    if (validatedData.regions && validatedData.regions.length >= 0) body.regions = validatedData.regions
    if (validatedData.branches && validatedData.branches.length >= 0) body.branches = validatedData.branches
    if (validatedData.stations && validatedData.stations.length >= 0) body.stations = validatedData.stations

    const response = await this.request<Campaign>('/campaigns/', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    return CampaignSchema.parse(response)
  }
  
  /**
   * Atualizar campanha existente
   * PUT /api/campaigns/{id}
   */
  async update(id: string, data: UpdateCampaignDTO): Promise<Campaign> {
    const validatedData = UpdateCampaignSchema.parse(data)
    const body: Record<string, any> = { ...validatedData }
    const response = await this.request<Campaign>(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })

    return CampaignSchema.parse(response)
  }
  
  /**
   * Deletar campanha (soft delete)
   * DELETE /api/campaigns/{id}
   */
  async delete(id: string): Promise<void> {
    await this.request<void>(`/campaigns/${id}`, {
      method: 'DELETE',
    })
  }
  
  /**
   * Buscar imagens de uma campanha
   * GET /api/campaigns/{id}/images
   */
  async getImages(campaignId: string): Promise<CampaignImage[]> {
    const response = await this.request<any>(`/campaigns/${campaignId}/images`)
    let imagesRaw: any[] = []
    if (Array.isArray(response)) {
      imagesRaw = response
    } else if (response && Array.isArray(response.images)) {
      imagesRaw = response.images
    }
    // Manter URLs como vêm da API (relativas funcionam com Gateway)
    const images = imagesRaw
    return z.array(CampaignImageSchema).parse(images)
  }
  
  /**
   * Upload de imagens para campanha
   * POST /api/campaigns/{id}/images
   */
  async uploadImages(campaignId: string, files: File[]): Promise<CampaignImage[]> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    
    const token = localStorage.getItem('i9_smart_auth_token')
    
    const response = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/images`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`
      }))
      throw new Error(error.message || 'Upload failed')
    }
    
    const result = await response.json()
    // Suportar { images: [...] } ou [...] direto
    const imagesRaw: any[] = Array.isArray(result) ? result : (Array.isArray(result?.images) ? result.images : [])
    // Manter URLs como vêm da API (relativas funcionam com Gateway)
    const images = imagesRaw
    return z.array(CampaignImageSchema).parse(images)
  }
  
  /**
   * Reordenar imagens de campanha
   * PUT /api/campaigns/{id}/images/order
   */
  async reorderImages(campaignId: string, imageIds: string[]): Promise<void> {
    await this.request<void>(`/campaigns/${campaignId}/images/order`, {
      method: 'PUT',
      body: JSON.stringify(imageIds),
    })
  }
  
  /**
   * Deletar imagem
   * DELETE /api/images/{id}
   */
  async deleteImage(imageId: string, campaignId: string): Promise<void> {
    const token = localStorage.getItem('i9_smart_auth_token')
    const authHeaders: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
    }
    // Endpoint oficial acordado
    const resp = await fetch(`${this.baseURL}/api/campaigns/${campaignId}/images/${imageId}`, {
      method: 'DELETE',
      headers: authHeaders,
    })
    if (resp.ok) return
    const text = await resp.text().catch(() => '')
    throw new Error(text || `HTTP ${resp.status}: ${resp.statusText}`)
  }
}

// =============================================================================
// 4. EXPORTAR INSTÂNCIA ÚNICA
// =============================================================================

export const campaignsService = new CampaignsService()

// =============================================================================
// 5. HOOKS CUSTOMIZADOS PARA REACT QUERY
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Hook para buscar todas as campanhas
 */
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsService.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

/**
 * Hook para buscar campanhas com paginação
 */
export function useCampaignsList(params: CampaignListParams) {
  return useQuery<{ items: Campaign[]; page: number; page_size: number; total: number; total_pages: number }>({
    queryKey: ['campaigns', 'list', params],
    queryFn: () => campaignsService.list(params),
    placeholderData: (prev) => prev,
  })
}

/**
 * Hook para buscar campanha por ID
 */
export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignsService.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook para buscar campanhas ativas
 */
export function useActiveCampaigns() {
  return useQuery({
    queryKey: ['campaigns', 'active'],
    queryFn: () => campaignsService.getActive(),
    staleTime: 30 * 1000, // 30 segundos (cache da API é 2 minutos)
    refetchInterval: 60 * 1000, // Refetch a cada 1 minuto
  })
}

/**
 * Hook para criar campanha
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateCampaignDTO) => campaignsService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
      toast.success('Campanha criada com sucesso!')
      return data
    },
    onError: (error) => {
      toast.error(`Erro ao criar campanha: ${error.message}`)
    },
  })
}

/**
 * Hook para atualizar campanha
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignDTO }) =>
      campaignsService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', data.id] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
      toast.success('Campanha atualizada com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar campanha: ${error.message}`)
    },
  })
}

/**
 * Hook para deletar campanha
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => campaignsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
      toast.success('Campanha excluída com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao excluir campanha: ${error.message}`)
    },
  })
}

/**
 * Hook para buscar imagens de uma campanha
 */
export function useCampaignImages(campaignId: string) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'images'],
    queryFn: () => campaignsService.getImages(campaignId),
    enabled: !!campaignId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

/**
 * Hook para upload de imagens
 */
export function useUploadImages() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ campaignId, files }: { campaignId: string; files: File[] }) =>
      campaignsService.uploadImages(campaignId, files),
    onSuccess: (data, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', campaignId] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', campaignId, 'images'] })
      toast.success(`${data.length} imagem(ns) enviada(s) com sucesso!`)
    },
    onError: (error) => {
      toast.error(`Erro ao fazer upload: ${error.message}`)
    },
  })
}

/**
 * Hook para reordenar imagens
 */
export function useReorderImages() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ campaignId, imageIds }: { campaignId: string; imageIds: string[] }) =>
      campaignsService.reorderImages(campaignId, imageIds),
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', campaignId] })
      toast.success('Ordem das imagens atualizada!')
    },
    onError: (error) => {
      toast.error(`Erro ao reordenar imagens: ${error.message}`)
    },
  })
}

/**
 * Hook para deletar imagem
 */
export function useDeleteImage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ imageId, campaignId }: { imageId: string; campaignId: string }) => campaignsService.deleteImage(imageId, campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      // Invalidar cache de imagens de todas as campanhas
      queryClient.invalidateQueries({ 
        queryKey: ['campaigns'], 
        predicate: (query) => query.queryKey.includes('images')
      })
      toast.success('Imagem removida com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao remover imagem: ${error.message}`)
    },
  })
}
