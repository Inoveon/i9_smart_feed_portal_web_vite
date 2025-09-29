import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const StationBranchSchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  name: z.string().optional(),
  city: z.string().optional(),
  state: z.string(),
  region: z.string().optional(),
})

const StationSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  branch_id: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  branch: StationBranchSchema.optional(),
})

const StationsAvailableSchema = z.object({
  regions: z.record(z.array(z.object({ code: z.string(), name: z.string(), state: z.string() }))),
  branches: z.record(z.object({
    name: z.string(),
    state: z.string(),
    region: z.string(),
    stations: z.array(z.object({ code: z.string(), name: z.string() }))
  }))
})

export type Station = z.infer<typeof StationSchema>
export type StationsAvailable = z.infer<typeof StationsAvailableSchema>

const PaginatedSchema = <T extends z.ZodTypeAny>(item: T) => z.object({
  items: z.array(item),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
  total_pages: z.number(),
  has_next: z.boolean().optional(),
  has_prev: z.boolean().optional(),
})

export type StationListParams = {
  page?: number
  limit?: number
  search?: string
  branch_id?: string
  branch_code?: string
  state?: string
  is_active?: boolean
  sort?: string
  order?: 'asc' | 'desc'
}

class StationsService {
  private baseURL = '' // Usar URLs relativas - nginx fará proxy para API

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    try {
      const token = localStorage.getItem('i9_smart_auth_token')
      const res = await fetch(`${this.baseURL}/api${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
        throw new Error(err.detail || err.message || `HTTP ${res.status}`)
      }
      return res.json()
    } catch (e: any) {
      if (e?.name === 'AbortError') throw new Error('Timeout ao comunicar com a API')
      throw e
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async getAll(): Promise<Station[]> {
    const data = await this.request<unknown>('/stations')
    return z.array(StationSchema).parse(data)
  }

  async list(params: StationListParams = {}): Promise<{ items: Station[]; page: number; page_size: number; total: number; total_pages: number }> {
    const qs = new URLSearchParams()
    if (params.page) qs.set('page', String(params.page))
    if (params.limit) qs.set('limit', String(params.limit))
    if (params.search) qs.set('search', params.search)
    if (params.branch_id) qs.set('branch_id', params.branch_id)
    if (params.branch_code) qs.set('branch_code', params.branch_code)
    if (params.state) qs.set('state', params.state)
    if (typeof params.is_active === 'boolean') qs.set('is_active', String(params.is_active))
    if (params.sort) qs.set('sort', params.sort)
    if (params.order) qs.set('order', params.order)
    const ep = `/stations${qs.toString() ? `?${qs.toString()}` : ''}`
    const data = await this.request<any>(ep)
    if (Array.isArray(data)) {
      const items = z.array(StationSchema).parse(data)
      return { items, page: params.page || 1, page_size: items.length, total: items.length, total_pages: 1 }
    }
    const parsed = PaginatedSchema(StationSchema).safeParse(data)
    if (parsed.success) return parsed.data
    const items = z.array(StationSchema).parse(data.items || [])
    return { items, page: data.page || 1, page_size: data.page_size || items.length, total: data.total || items.length, total_pages: data.total_pages || 1 }
  }

  async getActive(): Promise<Station[]> {
    const data = await this.request<unknown>('/stations/active')
    return z.array(StationSchema).parse(data)
  }

  async getById(id: string): Promise<Station> {
    const data = await this.request<unknown>(`/stations/${id}`)
    return StationSchema.parse(data)
  }

  async getByBranch(branchId: string): Promise<Station[]> {
    const data = await this.request<unknown>(`/branches/${branchId}/stations`)
    return z.array(StationSchema).parse(data)
  }

  async getByBranchAndCode(branchCode: string, stationCode: string): Promise<Station> {
    const data = await this.request<unknown>(`/stations/by-branch-and-code/${branchCode}/${stationCode}`)
    return StationSchema.parse(data)
  }

  async getAvailable(): Promise<StationsAvailable> {
    const data = await this.request<unknown>('/stations/available')
    return StationsAvailableSchema.parse(data)
  }

  async create(payload: Partial<Station>): Promise<Station> {
    const data = await this.request<unknown>('/stations', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return StationSchema.parse(data)
  }

  async update(id: string, payload: Partial<Station>): Promise<Station> {
    const data = await this.request<unknown>(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return StationSchema.parse(data)
  }

  async delete(id: string): Promise<void> {
    await this.request<void>(`/stations/${id}`, { method: 'DELETE' })
  }
}

export const stationsService = new StationsService()

// Hooks React Query
export function useStations() {
  return useQuery({ queryKey: ['stations'], queryFn: () => stationsService.getAll() })
}

export function useStation(id: string) {
  return useQuery({ queryKey: ['stations', id], queryFn: () => stationsService.getById(id), enabled: !!id })
}

export function useStationsByBranch(branchId: string) {
  return useQuery({ queryKey: ['branches', branchId, 'stations'], queryFn: () => stationsService.getByBranch(branchId), enabled: !!branchId })
}

export function useStationsAvailable() {
  return useQuery({ queryKey: ['stations', 'available'], queryFn: () => stationsService.getAvailable(), staleTime: 60 * 60 * 1000 })
}

export function useStationsList(params: StationListParams) {
  return useQuery<{ items: Station[]; page: number; page_size: number; total: number; total_pages: number }>({
    queryKey: ['stations', 'list', params],
    queryFn: () => stationsService.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateStation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Station>) => stationsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stations'] })
    },
  })
}

export function useUpdateStation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Station> }) => stationsService.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['stations'] })
      qc.invalidateQueries({ queryKey: ['stations', id] })
    },
  })
}

export function useDeleteStation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stationsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stations'] })
    },
  })
}
