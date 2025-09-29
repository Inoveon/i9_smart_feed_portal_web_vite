/**
 * PÁGINA RESET DE SENHA - i9 Smart Campaigns Portal
 * 
 * Funcionalidades:
 * - Formulário para nova senha com token
 * - Validação de senha com força
 * - Confirmação de senha
 * - Integração com API (quando disponível)
 * - Redirect após sucesso
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'

import { ResetPasswordData, ResetPasswordSchema } from '@/types/auth'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
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

// Simulação de serviço de reset de senha (API real não disponível ainda)
async function resetPassword(_: ResetPasswordData): Promise<void> {
  // NOTA: API de reset de senha ainda não está disponível
  // Endpoint assumido: POST /api/auth/reset-password
  // Por enquanto, simular o comportamento esperado
  
  
  
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Por enquanto, sempre falhar com mensagem informativa
  throw new Error('Endpoint de reset de senha ainda não disponível na API. Entre em contato com o administrador.')
}

function SuccessMessage() {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Senha redefinida!</h3>
        <p className="text-muted-foreground">
          Sua senha foi alterada com sucesso. Agora você pode fazer login com a nova senha.
        </p>
      </div>
      
      <Button asChild className="w-full">
        <Link to="/auth/login">
          Fazer Login
        </Link>
      </Button>
    </div>
  )
}

function InvalidTokenMessage() {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Link inválido ou expirado</h3>
        <p className="text-muted-foreground">
          Este link de redefinição de senha é inválido ou já expirou. 
          Solicite um novo link de redefinição.
        </p>
      </div>
      
      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link to="/auth/forgot-password">
            Solicitar novo link
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full">
          <Link to="/auth/login">
            Voltar ao Login
          </Link>
        </Button>
      </div>
    </div>
  )
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const token = searchParams.get('token')

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: token || '',
      new_password: '',
      confirm_password: '',
    },
  })

  // Validar token na inicialização
  useEffect(() => {
    if (token) {
      form.setValue('token', token)
    }
  }, [token, form])

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setSuccess(true)
      toast.success('Senha redefinida com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao redefinir senha')
    },
  })

  const onSubmit = (values: ResetPasswordData) => {
    resetPasswordMutation.mutate(values)
  }

  const passwordValue = form.watch('new_password')

  // Se não há token, mostrar erro
  if (!token) {
    return (
      <AuthLayout title="Link Inválido" description="Este link de redefinição é inválido ou expirou">
        <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <InvalidTokenMessage />
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Nova Senha" description="Defina sua nova senha">
      <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                {success ? 'Sucesso!' : 'Nova Senha'}
              </CardTitle>
              {!success && (
                <CardDescription>
                  Defina sua nova senha
                </CardDescription>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {success ? (
              <SuccessMessage />
            ) : (
              <>
                <Alert>
                  <AlertDescription>
                    <strong>Nota:</strong> O endpoint de reset de senha ainda não está 
                    disponível na API. Esta funcionalidade será habilitada em breve.
                  </AlertDescription>
                </Alert>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="new_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Digite sua nova senha"
                                {...field}
                                disabled={resetPasswordMutation.isPending}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={resetPasswordMutation.isPending}
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

                    <FormField
                      control={form.control}
                      name="confirm_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Nova Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirme sua nova senha"
                                {...field}
                                disabled={resetPasswordMutation.isPending}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={resetPasswordMutation.isPending}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Redefinindo...
                        </div>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Redefinir Senha
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="space-y-4">
                  <Separator />
                  
                  <div className="text-center">
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth/login">
                        Voltar ao Login
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
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
 * async function resetPassword(data: ResetPasswordData): Promise<void> {
 *   await apiClient.post('/api/auth/reset-password', {
 *     token: data.token,
 *     new_password: data.new_password
 *   })
 * }
 */
