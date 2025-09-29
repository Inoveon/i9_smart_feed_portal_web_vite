import React from 'react'
import { 
  Calendar, 
  FileText, 
  TrendingUp, 
  Users,
  Monitor,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'

// Componentes UI (Shadcn)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Layout
import { AppLayout } from '@/components/layouts/AppLayout'

// Components
// import { DashboardSkeleton } from '@/components/features/dashboard/DashboardSkeleton'
import { DashboardError } from '@/components/features/dashboard/ErrorAlert'

// Services & Hooks
import { useAuth } from '@/hooks/useAuth'
import { useDashboardMetrics, useViewsMetrics, useStationsMetrics } from '@/services/metrics.service'
import { useActiveCampaigns } from '@/services/campaigns.service'
import { useRecentActivities } from '@/services/activity.service'

/**
 * PÁGINA PRINCIPAL DO DASHBOARD
 * 
 * Features:
 * - Visão geral das campanhas ativas
 * - Métricas importantes
 * - Cards de estatísticas
 * - Links para principais funcionalidades
 * - Layout responsivo usando AppLayout
 */
export function DashboardPage() {
  const { user, isAdmin, canEdit } = useAuth()

  // Verificar token (sem logs em produção)
  // token disponível no localStorage se necessário

  // =============================================================================
  // DADOS REAIS DA API
  // =============================================================================

  // React Query hooks para buscar dados reais
  const { data: dashboardMetrics, error: metricsError } = useDashboardMetrics()
  const { data: todayViews } = useViewsMetrics('today')
  const { data: stationsMetrics } = useStationsMetrics()
  const { data: activeCampaigns } = useActiveCampaigns()
  const { data: recentActivities } = useRecentActivities()
  
  // Erros tratados pela UI; sem logs

  // Estados de loading e erro
  // const isLoading = metricsLoading || viewsLoading || stationsLoading || campaignsLoading || activitiesLoading
  const hasError = metricsError

  // Stats baseados em dados reais
  const stats = {
    totalCampaigns: dashboardMetrics?.overview.total_campaigns || 0,
    activeCampaigns: dashboardMetrics?.overview.total_active || 0,
    totalStations: stationsMetrics?.coverage?.total_stations || 0,
    todayViews: todayViews?.views?.total || 0,
  }

  // Campanhas ativas para exibição
  const topCampaigns = activeCampaigns?.campaigns?.slice(0, 2) || []

  // Loading state
  // Não bloquear a página inteira durante carregamento; exibir parciais com defaults

  // Error state
  if (hasError) {
    return (
      <AppLayout>
        <DashboardError 
          error={hasError}
          onRetry={() => {
            window.location.reload()
          }}
        />
      </AppLayout>
    )
  }

  // =============================================================================
  // COMPONENTES
  // =============================================================================

  const StatsCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend 
  }: {
    title: string
    value: string | number
    description: string
    icon: React.ElementType
    trend?: 'up' | 'down' | 'stable'
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
        {trend && (
          <div className={`flex items-center pt-1 text-xs ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>
              {trend === 'up' ? 'Crescendo' : trend === 'down' ? 'Diminuindo' : 'Estável'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const ActivityItem = ({ activity }: { 
    activity: {
      id: string
      type: string
      title: string
      timestamp: string
      user?: {
        full_name?: string
        username?: string
      }
    }
  }) => {
    const icons: Record<string, React.ElementType> = {
      campaign_created: FileText,
      campaign_updated: FileText,
      campaign_deleted: FileText,
      campaign_activated: CheckCircle,
      campaign_paused: Activity,
      image_uploaded: Monitor,
      station_update: Monitor
    }
    
    const Icon = icons[activity.type] || Activity
    
    // Formatar timestamp para "X tempo atrás"
    const getTimeAgo = (timestamp: string) => {
      const now = new Date()
      const activityTime = new Date(timestamp)
      const diffMs = now.getTime() - activityTime.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 0) {
        return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`
      } else if (diffHours > 0) {
        return `${diffHours}h atrás`
      } else {
        const diffMinutes = Math.floor(diffMs / (1000 * 60))
        return `${diffMinutes}min atrás`
      }
    }
    
    return (
      <div className="flex items-start space-x-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">{activity.title}</p>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{getTimeAgo(activity.timestamp)}</span>
            <span>•</span>
            <span>{activity.user?.full_name || activity.user?.username || 'Sistema'}</span>
          </div>
        </div>
      </div>
    )
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.full_name || user?.username}! 
              Aqui está um resumo das suas campanhas.
            </p>
          </div>
          
          {canEdit() && (
            <Button asChild>
              <Link to="/campaigns/new">
                <FileText className="mr-2 h-4 w-4" />
                Nova Campanha
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Campanhas"
            value={stats.totalCampaigns}
            description="Todas as campanhas criadas"
            icon={FileText}
            trend={(dashboardMetrics?.recent_activity.last_7_days || 0) > 0 ? "up" : "stable"}
          />
          <StatsCard
            title="Campanhas Ativas"
            value={stats.activeCampaigns}
            description="Rodando agora"
            icon={Activity}
            trend="stable"
          />
          <StatsCard
            title="Estações Conectadas"
            value={stats.totalStations}
            description={`${stationsMetrics?.coverage?.stations_with_campaigns || 0} com campanhas`}
            icon={Monitor}
            trend="up"
          />
          <StatsCard
            title="Visualizações Hoje"
            value={stats.todayViews.toLocaleString()}
            description="Impressões estimadas"
            icon={TrendingUp}
            trend="up"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Campanhas Recentes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas Ativas</CardTitle>
                <CardDescription>
                  Suas campanhas atualmente em exibição
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Campanhas ativas da API */}
                  {topCampaigns.length > 0 ? (
                    topCampaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {campaign.stations && campaign.stations.length > 0 
                              ? `Estações: ${campaign.stations.join(', ')}` 
                              : 'Global'
                            } • Prioridade: {campaign.priority}
                          </p>
                          {campaign.description && (
                            <p className="text-xs text-muted-foreground">{campaign.description}</p>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium text-green-600">
                            Ativa
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {campaign.default_display_time ? `${(campaign.default_display_time / 1000)}s por imagem` : '5s por imagem'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma campanha ativa no momento
                    </div>
                  )}

                  <div className="pt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/campaigns">
                        Ver Todas as Campanhas
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Atividade Recente */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Últimas ações no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities && recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Nenhuma atividade recente
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to="/activities">
                        Ver Histórico Completo
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        {canEdit() && (
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às funcionalidades mais usadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-auto p-6" asChild>
                  <Link to="/campaigns/new">
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="h-8 w-8" />
                      <span>Nova Campanha</span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto p-6" asChild>
                  <Link to="/campaigns/new?scheduled=true">
                    <div className="flex flex-col items-center space-y-2">
                      <Calendar className="h-8 w-8" />
                      <span>Agendar Campanha</span>
                    </div>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-auto p-6" asChild>
                  <Link to="/analytics">
                    <div className="flex flex-col items-center space-y-2">
                      <TrendingUp className="h-8 w-8" />
                      <span>Ver Relatórios</span>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Only Section */}
        {isAdmin() && (
          <Card>
            <CardHeader>
              <CardTitle>Administração</CardTitle>
              <CardDescription>
                Funcionalidades exclusivas do administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" asChild>
                  <Link to="/users">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar Usuários
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link to="/stations">
                    <Monitor className="mr-2 h-4 w-4" />
                    Configurar Estações
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
