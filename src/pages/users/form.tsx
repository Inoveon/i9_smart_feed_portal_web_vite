import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppLayout } from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/features/page/PageHeader'
import { ErrorBoundary } from '@/components/features/ErrorBoundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, UserPlus, AlertCircle } from 'lucide-react'
import { 
  useUserQuery, 
  useCreateUserMutation, 
  useUpdateUserMutation,
  CreateUserSchema,
  UpdateUserSchema,
  type CreateUserDTO,
  type UpdateUserDTO
} from '@/services/users.service'

// Schema do formulário (diferente para criação e edição)
const formSchemaCreate = CreateUserSchema.extend({
  password_confirm: z.string().min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.password === data.password_confirm, {
  message: "As senhas não coincidem",
  path: ["password_confirm"]
})

const formSchemaUpdate = UpdateUserSchema

type FormDataCreate = z.infer<typeof formSchemaCreate>
type FormDataUpdate = z.infer<typeof formSchemaUpdate>

export function UserFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  // Queries e mutations
  const { data: user, isLoading: isLoadingUser } = useUserQuery(id)
  const createMutation = useCreateUserMutation()
  const updateMutation = useUpdateUserMutation()

  // Form
  const form = useForm<FormDataCreate | FormDataUpdate>({
    resolver: zodResolver(isEdit ? formSchemaUpdate : formSchemaCreate),
    defaultValues: isEdit ? {
      email: '',
      username: '',
      full_name: '',
      role: 'viewer' as const,
      is_active: true,
      is_verified: false
    } : {
      email: '',
      username: '',
      password: '',
      password_confirm: '',
      full_name: '',
      role: 'viewer' as const
    }
  })

  // Preencher form com dados do usuário em edição
  useEffect(() => {
    if (user && isEdit) {
      form.reset({
        email: user.email,
        username: user.username,
        full_name: user.full_name || '',
        role: user.role,
        is_active: user.is_active,
        is_verified: user.is_verified
      })
    }
  }, [user, isEdit, form])

  // Submit handler
  const handleSubmit = async (data: FormDataCreate | FormDataUpdate) => {
    try {
      if (isEdit && id) {
        // Atualizar usuário
        const updateData = data as UpdateUserDTO
        await updateMutation.mutateAsync({ id, data: updateData })
      } else {
        // Criar usuário
        const createData = data as FormDataCreate
        const { password_confirm, ...createPayload } = createData
        await createMutation.mutateAsync(createPayload as CreateUserDTO)
      }
      navigate('/users')
    } catch (error) {
      // Erro já tratado pelo mutation
    }
  }

  // Loading
  if (isEdit && isLoadingUser) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ErrorBoundary>
      <div className="p-6 space-y-6">
        <PageHeader
          title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}
          description={isEdit ? 'Atualize as informações do usuário' : 'Cadastre um novo usuário no sistema'}
          backButton={{
            label: 'Voltar',
            icon: ArrowLeft,
            onClick: () => navigate('/users')
          }}
        />

        <div className="max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="usuario_exemplo"
                              disabled={isEdit}
                            />
                          </FormControl>
                          <FormDescription>
                            {isEdit ? 'Username não pode ser alterado' : 'Apenas letras, números e underscore'}
                          </FormDescription>
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
                              {...field} 
                              type="email"
                              placeholder="usuario@exemplo.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ''}
                            placeholder="João da Silva"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isEdit && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password"
                                  placeholder="••••••••"
                                />
                              </FormControl>
                              <FormDescription>
                                Mínimo 8 caracteres, maiúscula, minúscula, número e especial
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="password_confirm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar Senha</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password"
                                  placeholder="••••••••"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Permissões e Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Papel</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o papel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">
                              Administrador - Acesso total
                            </SelectItem>
                            <SelectItem value="editor">
                              Editor - Criar e editar conteúdo
                            </SelectItem>
                            <SelectItem value="viewer">
                              Visualizador - Apenas leitura
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isEdit && (
                    <>
                      <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Usuário Ativo
                              </FormLabel>
                              <FormDescription>
                                Usuários inativos não podem fazer login
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="is_verified"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Email Verificado
                              </FormLabel>
                              <FormDescription>
                                Indica se o usuário confirmou seu email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              {!isEdit && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    O usuário receberá um email com as credenciais de acesso após a criação.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>Salvando...</>
                  ) : (
                    <>
                      {isEdit ? <Save className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                      {isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/users')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      </ErrorBoundary>
    </AppLayout>
  )
}

export default UserFormPage