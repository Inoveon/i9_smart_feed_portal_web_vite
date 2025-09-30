import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/features/page/PageHeader'
import { DataTableShell } from '@/components/features/table/DataTableShell'
import { PaginationBar } from '@/components/features/table/PaginationBar'
import { ErrorBoundary } from '@/components/features/ErrorBoundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Pencil, Trash2, Search, UserPlus, Shield, Key, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { 
  useUsersQuery, 
  useDeleteUserMutation,
  useResetPasswordMutation,
  ResetPasswordSchema,
  translateUserRole,
  getUserRoleBadgeColor,
  type User,
  type ResetPasswordDTO
} from '@/services/users.service'

export function UsersPage() {
  const { isAdmin, user: currentUser } = useAuth()
  const navigate = useNavigate()
  
  // Estados
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'admin' | 'editor' | 'viewer' | ''>('')
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('')
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null)
  
  // Queries e mutations
  const { data: usersResponse, isLoading, error, refetch } = useUsersQuery({
    page,
    limit,
    search,
    role: roleFilter,
    is_active: statusFilter
  })
  
  const deleteUserMutation = useDeleteUserMutation()
  const resetPasswordMutation = useResetPasswordMutation()
  
  // Form de reset de senha
  const resetPasswordForm = useForm<ResetPasswordDTO>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      new_password: ''
    }
  })
  
  // Handlers
  const handleEdit = (id: string) => {
    navigate(`/users/${id}/edit`)
  }
  
  const handleDelete = async () => {
    if (deleteUserId) {
      try {
        await deleteUserMutation.mutateAsync(deleteUserId)
        setDeleteUserId(null)
      } catch (error) {
        // Erro já tratado pelo mutation
      }
    }
  }
  
  const handleResetPassword = async (data: ResetPasswordDTO) => {
    if (resetPasswordUserId) {
      try {
        await resetPasswordMutation.mutateAsync({
          id: resetPasswordUserId,
          data
        })
        setResetPasswordUserId(null)
        resetPasswordForm.reset()
      } catch (error) {
        // Erro já tratado pelo mutation
      }
    }
  }
  
  // Dados dos usuários
  const users = usersResponse?.items || []
  const totalPages = usersResponse?.total_pages || 1
  
  // Badge de role
  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={getUserRoleBadgeColor(role) as any}>
        {translateUserRole(role)}
      </Badge>
    )
  }
  
  // Verifica se o usuário pode editar/deletar
  const canModifyUser = (user: User) => {
    // Não pode modificar a si mesmo
    if (currentUser?.id === user.id) return false
    // Admin pode modificar todos
    return true
  }
  
  // Verifica se é admin
  if (!isAdmin()) {
    return (
      <AppLayout>
        <div className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissão para acessar esta página. Apenas administradores podem gerenciar usuários.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    )
  }
  
  return (
    <AppLayout>
      <ErrorBoundary>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Gerenciar Usuários"
          description="Administre os usuários e suas permissões no sistema"
          primaryAction={{ 
            label: 'Novo Usuário', 
            icon: UserPlus,
            onClick: () => navigate('/users/new')
          }}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Usuários Cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toolbar de filtros */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={search}
                  onChange={(e) => { 
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9"
                />
              </div>
              <Select 
                value={roleFilter || 'all'} 
                onValueChange={(v) => { 
                  setRoleFilter(v === 'all' ? '' : v as any)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os papéis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os papéis</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={statusFilter === '' ? 'all' : statusFilter.toString()} 
                onValueChange={(v) => { 
                  setStatusFilter(v === 'all' ? '' : v === 'true')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Ativos</SelectItem>
                  <SelectItem value="false">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Lista de usuários */}
            <div className="relative max-h-[60vh] overflow-y-auto">
              <div className="overflow-x-auto">
                <DataTableShell 
                  isLoading={isLoading} 
                  error={error as any} 
                  itemsLength={users.length} 
                  onRetry={() => refetch()}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-4">Usuário</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Papel</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Último Acesso</th>
                        <th className="py-2 pr-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/40">
                          <td className="py-2 pr-4">
                            <div>
                              <p className="font-medium">
                                {user.full_name || user.username}
                                {currentUser?.id === user.id && (
                                  <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">@{user.username}</p>
                            </div>
                          </td>
                          <td className="py-2 pr-4">{user.email}</td>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-1">
                              {user.role === 'admin' && <Shield className="h-3 w-3" />}
                              {getRoleBadge(user.role)}
                            </div>
                          </td>
                          <td className="py-2 pr-4">
                            <Badge variant={user.is_active ? 'default' : 'secondary'}>
                              {user.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 text-xs text-muted-foreground">
                            {user.last_login ? 
                              new Date(user.last_login).toLocaleDateString('pt-BR') : 
                              'Nunca acessou'
                            }
                          </td>
                          <td className="py-2 pr-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => setResetPasswordUserId(user.id)}
                                disabled={!canModifyUser(user)}
                                title="Resetar senha"
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => handleEdit(user.id)}
                                disabled={!canModifyUser(user)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => setDeleteUserId(user.id)}
                                disabled={!canModifyUser(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </DataTableShell>
              </div>
            </div>
            
            {/* Paginação */}
            <PaginationBar
              page={page}
              totalPages={totalPages}
              limit={limit}
              onPrev={() => setPage(Math.max(1, page - 1))}
              onNext={() => setPage(Math.min(totalPages, page + 1))}
              onLimitChange={(newLimit) => {
                setLimit(newLimit)
                setPage(1)
              }}
            />
          </CardContent>
        </Card>
        
        {/* Dialog de confirmação de delete */}
        <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Desativação</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja desativar este usuário? O usuário não poderá mais fazer login no sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? 'Desativando...' : 'Desativar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Dialog de reset de senha */}
        <Dialog open={!!resetPasswordUserId} onOpenChange={() => {
          setResetPasswordUserId(null)
          resetPasswordForm.reset()
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resetar Senha</DialogTitle>
              <DialogDescription>
                Digite uma nova senha para o usuário. Ele precisará alterá-la no próximo login.
              </DialogDescription>
            </DialogHeader>
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
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
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setResetPasswordUserId(null)
                      resetPasswordForm.reset()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      </ErrorBoundary>
    </AppLayout>
  )
}

export default UsersPage