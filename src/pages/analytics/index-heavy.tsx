import { useState } from 'react'
import { AppLayout } from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/features/page/PageHeader'
import { ErrorBoundary } from '@/components/features/ErrorBoundary'
import { 
  useAnalytics, 
  useActivityMetrics 
} from '@/services/metrics.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Download,
  Target,
  Image as ImageIcon,
  Users
} from 'lucide-react'
import { metricsService } from '@/services/metrics.service'
import { toast } from 'sonner'

export function AnalyticsPage() {
  const [exportLoading, setExportLoading] = useState(false)
  
  // Hooks para dados - removemos useDashboardMetrics pois já temos dados em analytics
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics()
  const { data: activity, isLoading: activityLoading } = useActivityMetrics(7)
  
  const isLoading = analyticsLoading || activityLoading
  
  // Função para exportar relatório
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExportLoading(true)
      const data = await metricsService.exportReport(format)
      
      // Criar download
      const blob = new Blob([format === 'json' ? JSON.stringify(data, null, 2) : data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`Relatório exportado em ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Erro ao exportar relatório')
    } finally {
      setExportLoading(false)
    }
  }
  
  // Função para calcular tendência
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }
  
  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-500'
    if (change < 0) return 'text-red-500'
    return 'text-gray-500'
  }
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          <PageHeader
            title="Analytics"
            description="Métricas e análises do sistema"
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }
  
  return (
    <AppLayout>
      <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Analytics"
          description="Métricas e análises do sistema de campanhas"
          primaryAction={{
            label: 'Exportar Dados',
            icon: Download,
            onClick: () => handleExport('json'),
          }}
        />
        
        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {analytics?.kpis && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.kpis.total_campaigns}</div>
                  {analytics.trends?.campaigns && (
                    <p className={`text-xs ${getTrendColor(analytics.trends.campaigns.change_percentage)}`}>
                      {getTrendIcon(analytics.trends.campaigns.change_percentage)}
                      {Math.abs(analytics.trends.campaigns.change_percentage).toFixed(1)}% vs período anterior
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
                  <Activity className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.kpis.active_campaigns}</div>
                  <p className="text-xs text-muted-foreground">
                    {((analytics.kpis.active_campaigns / analytics.kpis.total_campaigns) * 100).toFixed(0)}% do total
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Imagens</CardTitle>
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.kpis.total_images}</div>
                  {analytics.trends?.images && (
                    <p className={`text-xs ${getTrendColor(analytics.trends.images.change_percentage)}`}>
                      {getTrendIcon(analytics.trends.images.change_percentage)}
                      {Math.abs(analytics.trends.images.change_percentage).toFixed(1)}% vs período anterior
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prioridade Média</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.kpis.average_priority.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">De 0 a 100</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cobertura</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.kpis.coverage_percentage.toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground">Estações atingidas</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        
        {/* Atividade Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividade de Campanhas */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade de Campanhas (7 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {activity?.campaigns_activity && activity.campaigns_activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.campaigns_activity.map((day) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${Math.min(100, (day.campaigns_created / 10) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">
                          {day.campaigns_created}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhuma atividade nos últimos 7 dias</p>
              )}
            </CardContent>
          </Card>
          
          {/* Atividade de Imagens */}
          <Card>
            <CardHeader>
              <CardTitle>Upload de Imagens (7 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              {activity?.images_activity && activity.images_activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.images_activity.map((day) => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-secondary rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (day.images_uploaded / 20) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">
                          {day.images_uploaded}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhuma atividade nos últimos 7 dias</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Top Campanhas */}
        {analytics?.top_performers && analytics.top_performers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Campanhas por Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.top_performers.map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Cobertura: {typeof campaign.station_coverage === 'number' 
                            ? `${campaign.station_coverage} estações` 
                            : campaign.station_coverage}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{campaign.priority}</p>
                      <p className="text-xs text-muted-foreground">prioridade</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Distribuição por Status */}
        {analytics?.comparisons?.by_status && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.comparisons.by_status).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{status}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {analytics?.comparisons?.by_region && (
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Região</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(analytics.comparisons.by_region).map(([region, count]) => (
                      <div key={region} className="flex items-center justify-between">
                        <span className="text-sm">{region || 'Sem região'}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {/* Ações de Exportação */}
        <Card>
          <CardHeader>
            <CardTitle>Exportar Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={() => handleExport('json')}
                disabled={exportLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar JSON
              </Button>
              <Button 
                onClick={() => handleExport('csv')}
                disabled={exportLoading}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Aviso sobre limitações */}
        <Alert>
          <AlertDescription>
            Sistema de analytics em desenvolvimento. Algumas métricas avançadas como impressões e taxa de engajamento 
            estarão disponíveis em breve.
          </AlertDescription>
        </Alert>
      </div>
      </ErrorBoundary>
    </AppLayout>
  )
}

export default AnalyticsPage