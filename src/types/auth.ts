import { z } from 'zod'

// =============================================================================
// SCHEMAS DE VALIDAÇÃO BASEADOS NA API REAL
// =============================================================================

// Schema para resposta de login (baseado no teste real da API)
export const LoginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
})

// Schema para dados de usuário (inferido do JWT)
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  full_name: z.string().optional(),
  role: z.enum(['admin', 'editor', 'viewer']),
  is_active: z.boolean().default(true),
  is_verified: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
})

// Schema para credenciais de login
export const LoginCredentialsSchema = z.object({
  username: z.string().min(1, 'Username é obrigatório'),
  password: z.string().min(1, 'Password é obrigatória'),
})

// Schema para refresh token
export const RefreshTokenSchema = z.object({
  refresh_token: z.string(),
})

// Schema para registro de usuário
export const RegisterDataSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
  full_name: z.string().min(2, 'Nome completo é obrigatório').optional(),
})

// Schema para esqueci minha senha
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

// Schema para reset de senha
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  new_password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'Senhas não conferem',
  path: ['confirm_password'],
})

// Schema para alteração de senha
export const ChangePasswordSchema = z.object({
  current_password: z.string().min(1, 'Senha atual é obrigatória'),
  new_password: z.string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'Senhas não conferem',
  path: ['confirm_password'],
})

// =============================================================================
// TIPOS EXPORTADOS
// =============================================================================

export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type User = z.infer<typeof UserSchema>
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>
export type RegisterData = z.infer<typeof RegisterDataSchema>
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>

// Estado de autenticação
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// JWT payload (inferido da estrutura do token)
export interface JWTPayload {
  sub: string // email do usuário
  role: User['role']
  exp: number
  type?: string // para refresh token
}