/**
 * COMPONENTE CHANGE PASSWORD FORM - Formulário de alteração de senha
 * 
 * Funcionalidades:
 * - Formulário com validação completa
 * - Verificação de senha atual
 * - Indicador de força da nova senha
 * - Confirmação de senha
 * - Integração com API real
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'

import { ChangePasswordData, ChangePasswordSchema } from '@/types/auth'
import { useChangePassword } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Componente para indicador de força da senha (reutilizado)
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

interface ChangePasswordFormProps {
  onSuccess?: () => void
  showCard?: boolean
  className?: string
}

export function ChangePasswordForm({ 
  onSuccess, 
  showCard = true,
  className = '' 
}: ChangePasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<ChangePasswordData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  const changePasswordMutation = useChangePassword()

  const onSubmit = async (values: ChangePasswordData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.current_password,
        newPassword: values.new_password,
      })
      
      setSuccess(true)
      form.reset()
      
      if (onSuccess) {
        setTimeout(onSuccess, 1500)
      }
    } catch (error) {
      // Erro já tratado pelo mutation hook
    }
  }

  const newPasswordValue = form.watch('new_password')

  const formContent = (
    <div className={`space-y-6 ${className}`}>
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Senha alterada com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {!success && (
        <>
          <Alert>
            <AlertDescription>
              <strong>Nota:</strong> O endpoint de alteração de senha ainda não foi testado. 
              Esta funcionalidade pode não estar disponível.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha atual"
                          {...field}
                          disabled={changePasswordMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={changePasswordMutation.isPending}
                        >
                          {showCurrentPassword ? (
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

              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Digite sua nova senha"
                          {...field}
                          disabled={changePasswordMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={changePasswordMutation.isPending}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    {newPasswordValue && (
                      <PasswordStrengthIndicator password={newPasswordValue} />
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
                          disabled={changePasswordMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={changePasswordMutation.isPending}
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
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Alterando senha...
                  </div>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Alterar Senha
                  </>
                )}
              </Button>
            </form>
          </Form>
        </>
      )}
    </div>
  )

  if (!showCard) {
    return formContent
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Alterar Senha
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  )
}

/**
 * EXEMPLO DE USO:
 * 
 * // Em uma página de configurações
 * function SettingsPage() {
 *   return (
 *     <div className="space-y-6">
 *       <ChangePasswordForm onSuccess={() => console.log('Senha alterada!')} />
 *       <OtherSettings />
 *     </div>
 *   )
 * }
 * 
 * // Como modal
 * function ChangePasswordModal({ open, onClose }) {
 *   return (
 *     <Dialog open={open} onOpenChange={onClose}>
 *       <DialogContent>
 *         <ChangePasswordForm 
 *           showCard={false} 
 *           onSuccess={onClose} 
 *         />
 *       </DialogContent>
 *     </Dialog>
 *   )
 * }
 * 
 * // Inline em outra página
 * function ProfilePage() {
 *   return (
 *     <div className="max-w-2xl">
 *       <ProfileInfo />
 *       <ChangePasswordForm className="mt-8" />
 *     </div>
 *   )
 * }
 */