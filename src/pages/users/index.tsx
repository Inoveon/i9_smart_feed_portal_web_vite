import { useState } from 'react'
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
import { Pencil, Trash2, Search, UserPlus, Shield, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'

// Tipo temporário de usuário (até ter endpoint real)
interface User {
  id: string
  username: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'viewer'
  is_active: boolean
  created_at: string
  last_login?: string
}

// Service temporário (substituir quando tiver endpoint)
const usersService = {
  async getAll(): Promise<User[]> {
    // Simula busca de usuários - substituir por chamada real
    const token = localStorage.getItem('i9_smart_auth_token')
    if (!token) throw new Error('Não autenticado')
    
    // Por enquanto retorna lista mockada
    return [
      {
        id: '1',
        username: 'admin',
        email: 'admin@i9smart.com',
        full_name: 'Administrador',
        role: 'admin',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2024-01-24T10:00:00Z'
      },
      {
        id: '2',
        username: 'manager',
        email: 'manager@i9smart.com',
        full_name: 'Gerente de Campanhas',
        role: 'manager',
        is_active: true,
        created_at: '2024-01-10T00:00:00Z',
        last_login: '2024-01-23T15:00:00Z'
      },
      {
        id: '3',
        username: 'viewer',
        email: 'viewer@i9smart.com',
        full_name: 'Usuário Visualizador',
        role: 'viewer',
        is_active: true,
        created_at: '2024-01-15T00:00:00Z'
      }
    ]
  }
}

export function UsersPage() {
  const { isAdmin } = useAuth()
  
  // Estados
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // Hook para buscar usuários
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
    enabled: isAdmin()
  })
  
  // Filtrar usuários
  const filteredUsers = users?.filter(user => {
    const matchesSearch = search ? 
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.full_name.toLowerCase().includes(search.toLowerCase())
      : true
    
    const matchesRole = roleFilter ? user.role === roleFilter : true
    const matchesStatus = statusFilter ? 
      (statusFilter === 'active' ? user.is_active : !user.is_active) : true
    
    return matchesSearch && matchesRole && matchesStatus
  }) || []
  
  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / limit)
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * limit,
    page * limit
  )
  
  // Handler de delete (temporário)
  const handleDelete = async (_id: string, name: string) => {
    if (!confirm(`Desativar o usuário "${name}"?`)) return
    toast.error('Funcionalidade ainda não implementada no backend')
  }
  
  // Badge de role
  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      admin: 'destructive',
      manager: 'default',
      viewer: 'secondary'
    }
    const labels: Record<string, string> = {
      admin: 'Administrador',
      manager: 'Gerente',
      viewer: 'Visualizador'
    }
    return (
      <Badge variant={variants[role] || 'outline'}>
        {labels[role] || role}
      </Badge>
    )
  }
  
  // Verifica se é admin
  if (!isAdmin()) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
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
            onClick: () => toast.error('Funcionalidade de criar usuário ainda não implementada')
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
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter || 'all'} onValueChange={(v) => { setRoleFilter(v === 'all' ? '' : v); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os papéis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter || 'all'} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Lista de usuários */}
            <div className="relative max-h-[60vh] overflow-y-auto">
              <div className="overflow-x-auto">
                <DataTableShell isLoading={isLoading} error={error as any} itemsLength={paginatedUsers.length} onRetry={()=>refetch()}>
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
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/40">
                        <td className="py-2 pr-4">
                          <div>
                            <p className="font-medium">{user.full_name}</p>
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
                              title="Editar"
                              onClick={() => toast.error('Edição de usuário ainda não implementada')}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              title="Desativar" 
                              onClick={() => handleDelete(user.id, user.full_name)}
                              disabled={user.username === 'admin'}
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
              {/* Paginação */}
              <div className="sticky bottom-0 bg-background pt-2">
                <PaginationBar
                  page={page}
                  totalPages={totalPages || 1}
                  limit={limit}
                  onPrev={()=>setPage(p => Math.max(1, p-1))}
                  onNext={()=>setPage(p => p+1)}
                  onLimitChange={(n)=>{ setLimit(n); setPage(1) }}
                  isFetching={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Aviso sobre implementação */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> A funcionalidade de gerenciamento de usuários está em desenvolvimento. 
            Atualmente mostrando dados de exemplo. A integração completa com a API será implementada em breve.
          </AlertDescription>
        </Alert>
      </div>
      </ErrorBoundary>
    </AppLayout>
  )
}

export default UsersPage