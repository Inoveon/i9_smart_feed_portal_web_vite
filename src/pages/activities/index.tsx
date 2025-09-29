import { useState } from 'react'
import { AppLayout } from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/features/page/PageHeader'
import { DataTableShell } from '@/components/features/table/DataTableShell'
import { PaginationBar } from '@/components/features/table/PaginationBar'
import { ErrorBoundary } from '@/components/features/ErrorBoundary'
import { useRecentActivities } from '@/services/activity.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, FileText, Image, Users, Monitor } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ActivitiesPage() {
  // Estados para filtros e paginação
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  
  // Hook para buscar atividades
  const { data: activities, isLoading, error, refetch } = useRecentActivities()
  
  // Filtrar atividades localmente
  const filteredActivities = activities?.filter(activity => {
    const matchesSearch = search ? 
      activity.title.toLowerCase().includes(search.toLowerCase()) ||
      activity.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
      activity.user?.full_name?.toLowerCase().includes(search.toLowerCase())
      : true
    
    const matchesType = typeFilter ? activity.type === typeFilter : true
    
    return matchesSearch && matchesType
  }) || []
  
  // Paginação local
  const totalPages = Math.ceil(filteredActivities.length / limit)
  const paginatedActivities = filteredActivities.slice(
    (page - 1) * limit,
    page * limit
  )
  
  // Ícones por tipo de atividade
  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ElementType> = {
      campaign_created: FileText,
      campaign_updated: FileText,
      campaign_deleted: FileText,
      image_uploaded: Image,
      user_created: Users,
      user_updated: Users,
      station_update: Monitor,
    }
    return icons[type] || Clock
  }
  
  // Variante do badge por tipo
  const getActivityBadgeVariant = (type: string) => {
    if (type.includes('created')) return 'default'
    if (type.includes('updated')) return 'secondary'
    if (type.includes('deleted')) return 'destructive'
    return 'outline'
  }
  
  // Formatar tipo de atividade
  const formatActivityType = (type: string) => {
    const types: Record<string, string> = {
      campaign_created: 'Campanha Criada',
      campaign_updated: 'Campanha Atualizada',
      campaign_deleted: 'Campanha Excluída',
      campaign_activated: 'Campanha Ativada',
      campaign_paused: 'Campanha Pausada',
      image_uploaded: 'Imagem Enviada',
      user_created: 'Usuário Criado',
      user_updated: 'Usuário Atualizado',
      station_update: 'Estação Atualizada',
    }
    return types[type] || type
  }
  
  return (
    <AppLayout>
      <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Histórico de Atividades"
          description="Acompanhe todas as ações realizadas no sistema"
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toolbar de filtros */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar atividades..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter || 'all'} onValueChange={(v) => { setTypeFilter(v === 'all' ? '' : v); setPage(1) }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tipo de atividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="campaign_created">Campanhas Criadas</SelectItem>
                  <SelectItem value="campaign_updated">Campanhas Atualizadas</SelectItem>
                  <SelectItem value="campaign_deleted">Campanhas Excluídas</SelectItem>
                  <SelectItem value="image_uploaded">Imagens Enviadas</SelectItem>
                  <SelectItem value="user_created">Usuários Criados</SelectItem>
                  <SelectItem value="station_update">Estações Atualizadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Lista de atividades */}
            <div className="relative max-h-[60vh] overflow-y-auto">
              <div className="overflow-x-auto">
                <DataTableShell isLoading={isLoading} error={error as any} itemsLength={paginatedActivities.length} onRetry={()=>refetch()}>
                  <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Data/Hora</th>
                      <th className="py-2 pr-4">Tipo</th>
                      <th className="py-2 pr-4">Descrição</th>
                      <th className="py-2 pr-4">Usuário</th>
                      <th className="py-2 pr-4">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedActivities.map((activity) => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <tr key={activity.id} className="border-b hover:bg-muted/40">
                          <td className="py-2 pr-4 text-xs">
                            {format(new Date(activity.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </td>
                          <td className="py-2 pr-4">
                            <Badge variant={getActivityBadgeVariant(activity.type)}>
                              {formatActivityType(activity.type)}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{activity.title}</span>
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {activity.user?.full_name || activity.user?.username || 'Sistema'}
                          </td>
                          <td className="py-2 pr-4 text-xs text-muted-foreground">
                            {activity.description || '-'}
                          </td>
                        </tr>
                      )
                    })}
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
                  onLimitChange={()=>{}}
                  isFetching={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </ErrorBoundary>
    </AppLayout>
  )
}

export default ActivitiesPage