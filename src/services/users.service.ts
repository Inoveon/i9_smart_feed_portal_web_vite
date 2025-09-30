import { z } from 'zod'
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { toast } from 'sonner' // Temporariamente desabilitado

// Configuração do axios
const api = axios.create({
  baseURL: '', // Usar URLs relativas para funcionar com proxy
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('i9_smart_auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      localStorage.removeItem('i9_smart_auth_token')
      localStorage.removeItem('i9_smart_refresh_token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// =============================================================================
// SCHEMAS & TYPES
// =============================================================================

// Schema do usuário
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string(),
  full_name: z.string().optional().nullable(),
  role: z.enum(['admin', 'editor', 'viewer']),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  last_login: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  preferences: z.object({
    theme: z.string().optional(),
    palette: z.string().optional()
  }).optional()
})

export type User = z.infer<typeof UserSchema>

// Schema para criar usuário
export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Username deve ter no mínimo 3 caracteres'),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[@$!%*?&]/, 'Senha deve conter pelo menos um caractere especial'),
  full_name: z.string().optional(),
  role: z.enum(['admin', 'editor', 'viewer'])
})

export type CreateUserDTO = z.infer<typeof CreateUserSchema>

// Schema para atualizar usuário
export const UpdateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  username: z.string().min(3, 'Username deve ter no mínimo 3 caracteres').optional(),
  full_name: z.string().optional().nullable(),
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  is_active: z.boolean().optional(),
  is_verified: z.boolean().optional()
})

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>

// Schema para resetar senha
export const ResetPasswordSchema = z.object({
  new_password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[@$!%*?&]/, 'Senha deve conter pelo menos um caractere especial')
})

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>

// Schema de resposta paginada
export const UsersResponseSchema = z.object({
  items: z.array(UserSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
  total_pages: z.number(),
  has_next: z.boolean(),
  has_prev: z.boolean()
})

export type UsersResponse = z.infer<typeof UsersResponseSchema>

// Parâmetros de busca
export interface UsersQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: 'admin' | 'editor' | 'viewer' | ''
  is_active?: boolean | ''
  sort_by?: string
  order?: 'asc' | 'desc'
}

// =============================================================================
// SERVICE
// =============================================================================

class UsersService {
  private basePath = '/api/users'

  /**
   * Listar usuários com filtros e paginação
   */
  async getAll(params?: UsersQueryParams): Promise<UsersResponse> {
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('page_size', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.role) queryParams.append('role', params.role)
    if (params?.is_active !== undefined && params.is_active !== '') {
      queryParams.append('is_active', params.is_active.toString())
    }
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)

    const response = await api.get(`${this.basePath}?${queryParams}`)
    return UsersResponseSchema.parse(response.data)
  }

  /**
   * Obter usuário por ID
   */
  async getById(id: string): Promise<User> {
    const response = await api.get(`${this.basePath}/${id}`)
    return UserSchema.parse(response.data)
  }

  /**
   * Criar novo usuário
   */
  async create(data: CreateUserDTO): Promise<User> {
    const response = await api.post(this.basePath, data)
    return UserSchema.parse(response.data)
  }

  /**
   * Atualizar usuário
   */
  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const response = await api.put(`${this.basePath}/${id}`, data)
    return UserSchema.parse(response.data)
  }

  /**
   * Desativar/deletar usuário (soft delete)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${this.basePath}/${id}`)
  }

  /**
   * Resetar senha de um usuário
   */
  async resetPassword(id: string, data: ResetPasswordDTO): Promise<void> {
    await api.put(`${this.basePath}/${id}/password`, data)
  }
}

export const usersService = new UsersService()

// =============================================================================
// REACT QUERY HOOKS
// =============================================================================

/**
 * Hook para listar usuários
 */
export function useUsersQuery(params?: UsersQueryParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.getAll(params),
    staleTime: 30000 // 30 segundos
  })
}

/**
 * Hook para obter usuário por ID
 */
export function useUserQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => id ? usersService.getById(id) : Promise.reject('No ID'),
    enabled: !!id
  })
}

/**
 * Hook para criar usuário
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserDTO) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      console.log('Usuário criado com sucesso')
      alert('Usuário criado com sucesso!') // Temporário até corrigir o toast
      // toast.success('Usuário criado com sucesso')
    },
    onError: (error: any) => {
      console.error('Erro completo:', JSON.stringify(error.response?.data, null, 2))
      let message = 'Erro ao criar usuário'
      
      // Verificar se detail é um array
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Se for array, pegar a mensagem do primeiro erro
          const firstError = error.response.data.detail[0]
          message = firstError?.msg || firstError?.message || JSON.stringify(firstError)
        } else {
          message = error.response.data.detail
        }
      }
      
      console.error('Erro ao criar usuário:', message)
      alert(`Erro: ${message}`) // Temporariamente usar alert
      // toast.error(message)
    }
  })
}

/**
 * Hook para atualizar usuário
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) => 
      usersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      console.log('Usuário atualizado com sucesso')
      alert('Usuário atualizado com sucesso!')
      // toast.success('Usuário atualizado com sucesso')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao atualizar usuário'
      console.error('Erro ao atualizar usuário:', message)
      alert(`Erro: ${message}`)
      // toast.error(message)
    }
  })
}

/**
 * Hook para deletar usuário
 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      console.log('Usuário desativado com sucesso')
      // toast.success('Usuário desativado com sucesso')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao desativar usuário'
      console.error('Erro ao desativar usuário:', message)
      // toast.error(message)
    }
  })
}

/**
 * Hook para resetar senha
 */
export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResetPasswordDTO }) => 
      usersService.resetPassword(id, data),
    onSuccess: () => {
      console.log('Senha alterada com sucesso')
      // toast.success('Senha alterada com sucesso')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Erro ao alterar senha'
      console.error('Erro ao alterar senha:', message)
      // toast.error(message)
    }
  })
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Traduzir role para português
 */
export function translateUserRole(role: string): string {
  const translations: Record<string, string> = {
    'admin': 'Administrador',
    'editor': 'Editor',
    'viewer': 'Visualizador'
  }
  return translations[role] || role
}

/**
 * Obter cor do badge por role
 */
export function getUserRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    'admin': 'destructive',
    'editor': 'default',
    'viewer': 'secondary'
  }
  return colors[role] || 'outline'
}