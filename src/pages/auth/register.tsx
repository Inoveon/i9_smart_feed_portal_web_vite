/**
 * PÁGINA DE REGISTRO - i9 Smart Campaigns Portal
 * 
 * Funcionalidades:
 * - Formulário completo de registro
 * - Validação com Zod
 * - Integração com API real (quando disponível)
 * - Feedback de sucesso/erro
 * - Indicador de força da senha
 * - Redirect após registro
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react'

import { RegisterData, RegisterDataSchema } from '@/types/auth'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

// Componente para indicador de força da senha
function PasswordStrengthIndicator({ password }: { password: string }) {
  const getPasswordStrength = (pwd: string) => {
    let score = 0
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    }
    
    score = Object.values(checks).filter(Boolean).length
    
    const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
    const color = strength === 'weak' ? 'bg-red-500' : strength === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
    const percentage = (score / 5) * 100
    
    return { strength, color, percentage, checks }
  }

  if (!password) return null

  const { strength, color, percentage, checks } = getPasswordStrength(password)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Força da senha</span>
        <span className={`font-medium ${
          strength === 'weak' ? 'text-red-500' : 
          strength === 'medium' ? 'text-yellow-500' : 
          'text-green-500'
        }`}>
          {strength === 'weak' ? 'Fraca' : strength === 'medium' ? 'Média' : 'Forte'}
        </span>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className={checks.length ? 'text-green-600' : ''}>
          ✓ Pelo menos 8 caracteres
        </div>
        <div className={checks.lowercase ? 'text-green-600' : ''}>
          ✓ Uma letra minúscula
        </div>
        <div className={checks.uppercase ? 'text-green-600' : ''}>
          ✓ Uma letra maiúscula
        </div>
        <div className={checks.numbers ? 'text-green-600' : ''}>
          ✓ Um número
        </div>
      </div>
    </div>
  )
}

// Simulação de serviço de registro (API real não disponível ainda)
async function registerUser(_: RegisterData): Promise<void> {
  // NOTA: API de registro ainda não está disponível
  // Endpoint testado: POST /api/auth/register - retorna 404
  // Por enquanto, simular o comportamento esperado
  
  
  
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Por enquanto, sempre falhar com mensagem informativa
  throw new Error('Endpoint de registro ainda não disponível na API. Entre em contato com o administrador.')
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterData>({
    resolver: zodResolver(RegisterDataSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      full_name: '',
    },
  })

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Conta criada com sucesso! Faça login para continuar.')
      navigate('/auth/login')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar conta')
    },
  })

  const onSubmit = (values: RegisterData) => {
    registerMutation.mutate(values)
  }

  const passwordValue = form.watch('password')

  return (
    <AuthLayout title="Criar Conta" description="Crie sua conta no i9 Smart Campaigns Portal">
      <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl">Criar Conta</CardTitle>
              <CardDescription>
                Crie sua conta no i9 Smart Campaigns Portal
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                <strong>Nota:</strong> O endpoint de registro ainda não está disponível na API. 
                Esta funcionalidade será habilitada em breve.
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Seu nome completo" 
                          {...field} 
                          disabled={registerMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="seu@email.com" 
                          {...field} 
                          disabled={registerMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Usuário</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="usuario" 
                          {...field} 
                          disabled={registerMutation.isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Será usado para fazer login
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Sua senha"
                            {...field}
                            disabled={registerMutation.isPending}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={registerMutation.isPending}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      {passwordValue && (
                        <PasswordStrengthIndicator password={passwordValue} />
                      )}
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Criando conta...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Criar Conta
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="space-y-4">
              <Separator />
              
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Fazer Login
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}

/**
 * IMPLEMENTAÇÃO FUTURA - Quando API estiver disponível:
 * 
 * import { apiClient } from '@/lib/api-interceptor'
 * 
 * async function registerUser(data: RegisterData): Promise<void> {
 *   await apiClient.post('/api/auth/register', data)
 * }
 * 
 * // E adicionar no auth.service.ts:
 * async register(data: RegisterData): Promise<void> {
 *   const response = await this.request<void>('/api/auth/register', {
 *     method: 'POST',
 *     body: JSON.stringify(data),
 *   })
 *   return response
 * }
 */
