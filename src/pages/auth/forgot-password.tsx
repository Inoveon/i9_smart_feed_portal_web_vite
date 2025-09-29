/**
 * PÁGINA ESQUECI MINHA SENHA - i9 Smart Campaigns Portal
 * 
 * Funcionalidades:
 * - Formulário para solicitar reset de senha
 * - Validação de email com Zod
 * - Integração com API (quando disponível)
 * - Mensagem de confirmação
 * - Feedback de sucesso/erro
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

import { ForgotPasswordData, ForgotPasswordSchema } from '@/types/auth'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

// Simulação de serviço de esqueci senha (API real não disponível ainda)
async function requestPasswordReset(_: ForgotPasswordData): Promise<void> {
  // NOTA: API de esqueci senha ainda não está disponível
  // Endpoint testado: POST /api/auth/forgot-password - retorna 404
  // Por enquanto, simular o comportamento esperado
  
  
  
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Por enquanto, sempre falhar com mensagem informativa
  throw new Error('Endpoint de recuperação de senha ainda não disponível na API. Entre em contato com o administrador.')
}

function SuccessMessage({ email, onTryAgain }: { email: string, onTryAgain: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Email enviado!</h3>
        <p className="text-muted-foreground">
          Se o email <strong>{email}</strong> estiver registrado em nosso sistema, 
          você receberá instruções para redefinir sua senha.
        </p>
      </div>
      
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>Verifique sua caixa de entrada e spam.</p>
        <p>O link expira em 1 hora.</p>
      </div>
      
      <div className="space-y-3">
        <Button onClick={onTryAgain} variant="outline" className="w-full">
          Tentar outro email
        </Button>
        
        <Button asChild variant="default" className="w-full">
          <Link to="/auth/login">
            Voltar ao Login
          </Link>
        </Button>
      </div>
    </div>
  )
}

export function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState<string | null>(null)

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      const email = form.getValues('email')
      setEmailSent(email)
      toast.success('Email enviado! Verifique sua caixa de entrada.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao solicitar redefinição de senha')
    },
  })

  const onSubmit = (values: ForgotPasswordData) => {
    forgotPasswordMutation.mutate(values)
  }

  const handleTryAgain = () => {
    setEmailSent(null)
    form.reset()
  }

  return (
    <AuthLayout title="Esqueci Minha Senha" description="Insira seu email para receber instruções de redefinição">
      <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                {emailSent ? 'Verifique seu email' : 'Esqueci minha senha'}
              </CardTitle>
              {!emailSent && (
                <CardDescription>
                  Insira seu email para receber instruções de redefinição
                </CardDescription>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {emailSent ? (
              <SuccessMessage email={emailSent} onTryAgain={handleTryAgain} />
            ) : (
              <>
                <Alert>
                  <AlertDescription>
                    <strong>Nota:</strong> O endpoint de recuperação de senha ainda não está 
                    disponível na API. Esta funcionalidade será habilitada em breve.
                  </AlertDescription>
                </Alert>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                              disabled={forgotPasswordMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Enviando...
                        </div>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar instruções
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="space-y-4">
                  <Separator />
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Lembrou da senha?
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
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
 * async function requestPasswordReset(data: ForgotPasswordData): Promise<void> {
 *   await apiClient.post('/api/auth/forgot-password', data)
 * }
 * 
 * // E adicionar no auth.service.ts:
 * async forgotPassword(email: string): Promise<void> {
 *   const response = await this.request<void>('/api/auth/forgot-password', {
 *     method: 'POST',
 *     body: JSON.stringify({ email }),
 *   })
 *   return response
 * }
 */
