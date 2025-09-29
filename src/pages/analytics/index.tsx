import { AppLayout } from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/features/page/PageHeader'
import { useAnalytics } from '@/services/metrics.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  Activity, 
  BarChart3, 
  Download,
  Target,
  Image as ImageIcon,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

export function AnalyticsPage() {
  // Hook principal - apenas uma chamada
  const { data: analytics, isLoading } = useAnalytics()
  
  // Função simplificada de export
  const handleExport = () => {
    toast.success('Exportação iniciada')
    // Export será implementado depois se necessário
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
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Analytics"
          description="Métricas e análises do sistema de campanhas"
          primaryAction={{
            label: 'Exportar',
            icon: Download,
            onClick: handleExport,
          }}
        />
        
        {/* KPIs Principais - Versão Simplificada */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.kpis?.total_campaigns || 0}</div>
              <p className="text-xs text-muted-foreground">
                Todas as campanhas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.kpis?.active_campaigns || 0}</div>
              <p className="text-xs text-muted-foreground">
                Em execução agora
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Imagens</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.kpis?.total_images || 0}</div>
              <p className="text-xs text-muted-foreground">
                Arquivos cadastrados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobertura</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.kpis?.coverage_percentage?.toFixed(0) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Estações atingidas
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tendências */}
        {analytics?.trends && (
          <Card>
            <CardHeader>
              <CardTitle>Tendências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Campanhas</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-lg font-bold">
                      +{analytics.trends.campaigns?.change_percentage?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs período anterior</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Imagens</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-lg font-bold">
                      +{analytics.trends.images?.change_percentage?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">vs período anterior</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Prioridade Média</p>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-lg font-bold">
                      {analytics.kpis?.average_priority?.toFixed(1) || 0}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">de 0 a 100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Top Campanhas */}
        {analytics?.top_performers && analytics.top_performers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Campanhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.top_performers.slice(0, 5).map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{campaign.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{campaign.priority}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

export default AnalyticsPage