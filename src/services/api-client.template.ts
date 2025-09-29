/**
 * TEMPLATE DE SERVICE PARA API
 * 
 * Copie este arquivo e renomeie para seu domínio específico
 * Exemplo: campaigns.service.ts, users.service.ts, etc.
 * 
 * REGRA: NUNCA use dados mockados, SEMPRE conecte com API real
 */

import { z } from 'zod'

// =============================================================================
// 1. DEFINIR SCHEMAS DE VALIDAÇÃO (baseado na resposta real da API)
// =============================================================================

// Schema para validar item individual
const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Schema para criar novo item
const CreateItemSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
})

// Schema para atualizar item
const UpdateItemSchema = CreateItemSchema.partial()

// Schema para resposta paginada
const PaginatedResponseSchema = z.object({
  data: z.array(ItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

// =============================================================================
// 2. EXTRAIR TYPES DOS SCHEMAS
// =============================================================================

export type Item = z.infer<typeof ItemSchema>
export type CreateItemDTO = z.infer<typeof CreateItemSchema>
export type UpdateItemDTO = z.infer<typeof UpdateItemSchema>
export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// =============================================================================
// 3. CLASSE DE SERVIÇO
// =============================================================================

class ApiService {
  private baseURL = 'http://localhost:8000'
  private apiVersion = 'v1'
  
  /**
   * Método auxiliar para fazer requisições
   * Inclui tratamento de erro, timeout e headers padrão
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
    
    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${this.baseURL}/api/${this.apiVersion}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      })
      
      clearTimeout(timeoutId)
      
      // Tratar erros HTTP
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`
        }))
        
        throw new Error(error.message || `Request failed: ${response.status}`)
      }
      
      // Retornar resposta parseada
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
  // MÉTODOS CRUD
  // =============================================================================
  
  /**
   * Buscar todos os items (com paginação opcional)
   * SEMPRE teste este endpoint antes: curl http://localhost:8000/api/v1/items
   */
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    order?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Item>> {
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    const endpoint = `/items${query ? `?${query}` : ''}`
    
    const response = await this.request<PaginatedResponse<Item>>(endpoint)
    
    // Validar resposta com Zod
    return PaginatedResponseSchema.parse(response)
  }
  
  /**
   * Buscar item por ID
   * SEMPRE teste este endpoint antes: curl http://localhost:8000/api/v1/items/123
   */
  async getById(id: string): Promise<Item> {
    const response = await this.request<Item>(`/items/${id}`)
    return ItemSchema.parse(response)
  }
  
  /**
   * Criar novo item
   * SEMPRE teste este endpoint antes: 
   * curl -X POST http://localhost:8000/api/v1/items -d '{"name":"Test"}'
   */
  async create(data: CreateItemDTO): Promise<Item> {
    // Validar dados antes de enviar
    const validatedData = CreateItemSchema.parse(data)
    
    const response = await this.request<Item>('/items', {
      method: 'POST',
      body: JSON.stringify(validatedData),
    })
    
    return ItemSchema.parse(response)
  }
  
  /**
   * Atualizar item existente
   * SEMPRE teste este endpoint antes:
   * curl -X PUT http://localhost:8000/api/v1/items/123 -d '{"name":"Updated"}'
   */
  async update(id: string, data: UpdateItemDTO): Promise<Item> {
    // Validar dados antes de enviar
    const validatedData = UpdateItemSchema.parse(data)
    
    const response = await this.request<Item>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(validatedData),
    })
    
    return ItemSchema.parse(response)
  }
  
  /**
   * Deletar item
   * SEMPRE teste este endpoint antes:
   * curl -X DELETE http://localhost:8000/api/v1/items/123
   */
  async delete(id: string): Promise<void> {
    await this.request<void>(`/items/${id}`, {
      method: 'DELETE',
    })
  }
  
  // =============================================================================
  // MÉTODOS ESPECIALIZADOS
  // =============================================================================
  
  /**
   * Buscar items por status
   */
  async getByStatus(status: Item['status']): Promise<Item[]> {
    const response = await this.request<{ data: Item[] }>(
      `/items?status=${status}`
    )
    
    return z.array(ItemSchema).parse(response.data)
  }
  
  /**
   * Ações em lote
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await this.request<void>('/items/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  }
  
  /**
   * Upload de arquivo relacionado ao item
   */
  async uploadFile(itemId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${this.baseURL}/api/${this.apiVersion}/items/${itemId}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Upload failed')
    }
    
    return response.json()
  }
}

// =============================================================================
// 4. EXPORTAR INSTÂNCIA ÚNICA (Singleton)
// =============================================================================

export const itemService = new ApiService()

// =============================================================================
// 5. HOOKS CUSTOMIZADOS (opcional mas recomendado)
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Hook para buscar todos os items
 */
export function useItems(params?: Parameters<typeof itemService.getAll>[0]) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => itemService.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

/**
 * Hook para buscar item por ID
 */
export function useItem(id: string) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => itemService.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar item
 */
export function useCreateItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: itemService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success('Item criado com sucesso!')
      return data
    },
    onError: (error) => {
      toast.error(`Erro ao criar: ${error.message}`)
    },
  })
}

/**
 * Hook para atualizar item
 */
export function useUpdateItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemDTO }) =>
      itemService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['items', data.id] })
      toast.success('Item atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`)
    },
  })
}

/**
 * Hook para deletar item
 */
export function useDeleteItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: itemService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success('Item excluído com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`)
    },
  })
}

// =============================================================================
// INSTRUÇÕES DE USO
// =============================================================================

/**
 * 1. ANTES DE USAR ESTE TEMPLATE:
 *    - Teste TODOS os endpoints da API
 *    - Verifique a estrutura de resposta real
 *    - Ajuste os schemas Zod conforme necessário
 * 
 * 2. PARA CRIAR UM NOVO SERVICE:
 *    - Copie este arquivo
 *    - Renomeie para [dominio].service.ts
 *    - Substitua "Item" pelo nome do seu domínio
 *    - Ajuste endpoints e schemas
 * 
 * 3. USO NO COMPONENTE:
 * 
 * ```tsx
 * import { useItems, useCreateItem } from '@/services/items.service'
 * 
 * function ItemsPage() {
 *   const { data, isLoading, error } = useItems({ page: 1, limit: 10 })
 *   const createMutation = useCreateItem()
 *   
 *   if (isLoading) return <Skeleton />
 *   if (error) return <ErrorMessage error={error} />
 *   
 *   return (
 *     <div>
 *       {data?.data.map(item => (
 *         <ItemCard key={item.id} item={item} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 * 
 * LEMBRE-SE: NUNCA USE DADOS MOCKADOS!
 */