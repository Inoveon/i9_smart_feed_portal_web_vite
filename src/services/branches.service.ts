import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Schemas baseados nos campos observados na API
const BranchSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  city: z.string().optional(),
  state: z.string(),
  region: z.string().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  stations_count: z.number().optional(),
})

const BranchRegionsSchema = z.object({
  regions: z.array(z.string()),
  states_by_region: z.record(z.array(z.string())),
})

// Estatísticas podem variar; manter flexível
const BranchStatisticsSchema = z.object({}).passthrough()

export type Branch = z.infer<typeof BranchSchema>
export type BranchRegions = z.infer<typeof BranchRegionsSchema>
export type BranchStatistics = z.infer<typeof BranchStatisticsSchema>

const PaginatedSchema = <T extends z.ZodTypeAny>(item: T) => z.object({
  items: z.array(item),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
  total_pages: z.number(),
  has_next: z.boolean().optional(),
  has_prev: z.boolean().optional(),
})

export type BranchListParams = {
  page?: number
  limit?: number
  search?: string
  region?: string
  state?: string
  is_active?: boolean
  sort?: string
  order?: 'asc' | 'desc'
}

export type BranchListResult = { items: Branch[]; page: number; page_size: number; total: number; total_pages: number }

class BranchesService {
  private baseURL = '' // Usar URLs relativas - nginx fará proxy para API

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    try {
      const token = localStorage.getItem('i9_smart_auth_token')
      console.log(`[BranchesService] Requisição para ${endpoint}, token presente: ${!!token}`)
      
      const res = await fetch(`${this.baseURL}/api${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      })
      
      console.log(`[BranchesService] Resposta de ${endpoint}: ${res.status}`)
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
        console.error(`[BranchesService] Erro em ${endpoint}:`, err)
        throw new Error(err.detail || err.message || `HTTP ${res.status}`)
      }
      return res.json()
    } catch (e: any) {
      console.error(`[BranchesService] Erro na requisição ${endpoint}:`, e)
      if (e?.name === 'AbortError') throw new Error('Timeout ao comunicar com a API')
      throw e
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async getAll(): Promise<Branch[]> {
    const data = await this.request<unknown>('/branches')
    return z.array(BranchSchema).parse(data)
  }

  async list(params: BranchListParams = {}): Promise<BranchListResult> {
    const qs = new URLSearchParams()
    if (params.page) qs.set('page', String(params.page))
    if (params.limit) qs.set('limit', String(params.limit))
    if (params.search) qs.set('search', params.search)
    if (params.region) qs.set('region', params.region)
    if (params.state) qs.set('state', params.state)
    if (typeof params.is_active === 'boolean') qs.set('is_active', String(params.is_active))
    if (params.sort) qs.set('sort', params.sort)
    if (params.order) qs.set('order', params.order)
    const ep = `/branches${qs.toString() ? `?${qs.toString()}` : ''}`
    const data = await this.request<any>(ep)
    if (Array.isArray(data)) {
      const items = z.array(BranchSchema).parse(data)
      return { items, page: params.page || 1, page_size: items.length, total: items.length, total_pages: 1 }
    }
    const parsed = PaginatedSchema(BranchSchema).safeParse(data)
    if (parsed.success) return parsed.data
    // Fallback: tentar parse direto
    const items = z.array(BranchSchema).parse(data.items || [])
    return { items, page: data.page || 1, page_size: data.page_size || items.length, total: data.total || items.length, total_pages: data.total_pages || 1 }
  }

  async getActive(): Promise<Branch[]> {
    const data = await this.request<unknown>('/branches/active')
    return z.array(BranchSchema).parse(data)
  }

  async getById(id: string): Promise<Branch> {
    const data = await this.request<unknown>(`/branches/${id}`)
    return BranchSchema.parse(data)
  }

  async getByCode(code: string): Promise<Branch> {
    const data = await this.request<unknown>(`/branches/by-code/${code}`)
    return BranchSchema.parse(data)
  }

  async getRegions(): Promise<BranchRegions> {
    const data = await this.request<unknown>('/branches/regions')
    return BranchRegionsSchema.parse(data)
  }

  async getStatistics(id: string): Promise<BranchStatistics> {
    const data = await this.request<unknown>(`/branches/${id}/statistics`)
    return BranchStatisticsSchema.parse(data)
  }

  async create(payload: Partial<Branch>): Promise<Branch> {
    const data = await this.request<unknown>('/branches', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return BranchSchema.parse(data)
  }

  async update(id: string, payload: Partial<Branch>): Promise<Branch> {
    const data = await this.request<unknown>(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return BranchSchema.parse(data)
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/branches/${id}`, { method: 'DELETE' })
  }
}

export const branchesService = new BranchesService()

// Hooks React Query
export function useBranches() {
  return useQuery({ queryKey: ['branches'], queryFn: () => branchesService.getAll() })
}

export function useBranchesList(params: BranchListParams) {
  return useQuery<{ items: Branch[]; page: number; page_size: number; total: number; total_pages: number }>({
    queryKey: ['branches', 'list', params],
    queryFn: () => branchesService.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useBranch(id: string) {
  return useQuery({ queryKey: ['branches', id], queryFn: () => branchesService.getById(id), enabled: !!id })
}

export function useBranchRegions() {
  return useQuery({ queryKey: ['branches', 'regions'], queryFn: () => branchesService.getRegions(), staleTime: 60 * 60 * 1000 })
}

export function useBranchStatistics(id: string) {
  return useQuery({ queryKey: ['branches', id, 'statistics'], queryFn: () => branchesService.getStatistics(id), enabled: !!id })
}

export function useCreateBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Branch>) => branchesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
    },
  })
}

export function useUpdateBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Branch> }) => branchesService.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['branches'] })
      qc.invalidateQueries({ queryKey: ['branches', id] })
    },
  })
}

export function useDeleteBranch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => branchesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
    },
  })
}
