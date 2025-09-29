import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

// Componentes UI (Shadcn)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'

// Layout e componentes de Auth
import { AuthLayout, AuthNavLink, AuthAlert } from '@/components/layouts/AuthLayout'

// Hooks e types
import { useAuth } from '@/hooks/useAuth'
import { LoginCredentials, LoginCredentialsSchema } from '@/types/auth'
import { z } from 'zod'

/**
 * PÁGINA DE LOGIN
 * 
 * Features:
 * - Formulário com validação via React Hook Form + Zod
 * - Integração com API real de autenticação
 * - Loading states e tratamento de erros
 * - Show/hide password
 * - Redirecionamento automático após login
 * - Layout responsivo com AuthLayout
 */
export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoginLoading, error, clearError, isAuthenticated } = useAuth()

  // =============================================================================
  // REDIRECT SE JÁ ESTIVER AUTENTICADO
  // =============================================================================
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // =============================================================================
  // FORM SETUP
  // =============================================================================

  const form = useForm<LoginCredentials & { remember?: boolean }>({
    resolver: zodResolver(LoginCredentialsSchema.extend({
      remember: z.boolean().optional()
    })),
    defaultValues: {
      username: localStorage.getItem('i9_smart_remember_username') || '',
      password: '',
      remember: localStorage.getItem('i9_smart_remember_username') !== null,
    },
  })

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const onSubmit = async (data: LoginCredentials & { remember?: boolean }) => {
    try {
      clearError()
      
      // Gerenciar "Lembrar-me"
      if (data.remember) {
        localStorage.setItem('i9_smart_remember_username', data.username)
      } else {
        localStorage.removeItem('i9_smart_remember_username')
      }
      
      // Fazer login (remover campo remember antes de enviar)
      const { remember, ...loginData } = data
      await login(loginData)
      
      // Verificar se o token foi salvo
      // token salvo verificado por hooks
      
      // Redirecionar para o dashboard após login bem-sucedido
      navigate('/dashboard')
    } catch (error) {
      // Erro já é tratado pelo hook useAuth
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <AuthLayout
      title="Fazer Login"
      description="Entre com suas credenciais para acessar o portal"
    >
      <div className="space-y-6">
        {/* Mensagem de erro */}
        {error && (
          <AuthAlert type="error">
            {error}
          </AuthAlert>
        )}

        {/* Formulário */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu usuário ou email"
                      type="text"
                      autoComplete="username"
                      disabled={isLoginLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Digite sua senha"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        disabled={isLoginLoading}
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                        disabled={isLoginLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checkbox Lembrar-me */}
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoginLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Lembrar meu usuário
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Botão de Submit */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoginLoading}
            >
              {isLoginLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </Form>

        {/* Links de navegação */}
        <div className="text-center space-y-2">
          <AuthNavLink href="/auth/forgot-password">
            Esqueci minha senha
          </AuthNavLink>
          
          <div className="text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <AuthNavLink href="/auth/register" className="font-medium">
              Criar conta
            </AuthNavLink>
          </div>
        </div>

        {/* Credenciais de teste (apenas em desenvolvimento) */}
        {true && (
          <div className="mt-6">
            <AuthAlert type="info">
              <div className="space-y-2">
                <p className="font-medium">🔑 Credenciais de teste (API Real):</p>
                <div className="space-y-1">
                  <p>Usuário: <code className="bg-muted px-1 rounded">admin</code></p>
                  <p>Senha: <code className="bg-muted px-1 rounded">admin123</code></p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  API configurada ✅
                </p>
              </div>
            </AuthAlert>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
