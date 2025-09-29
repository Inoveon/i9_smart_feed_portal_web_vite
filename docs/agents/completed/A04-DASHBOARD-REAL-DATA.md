# 🎯 A04 - DASHBOARD COM DADOS REAIS

## 📋 Objetivo
Substituir TODOS os dados mockados do dashboard por dados reais da API, **mantendo o layout atual intacto**.

## ⚠️ REGRAS CRÍTICAS
1. **NÃO ALTERAR O LAYOUT** - O visual está perfeito, apenas substituir os dados
2. **USAR APENAS DADOS REAIS** - Nada de mock, apenas API
3. **FALLBACK INTELIGENTE** - Onde não houver dado, usar valor calculado ou padrão
4. **REACT QUERY SEMPRE** - Todas as chamadas via React Query

## 📊 Mapeamento de Dados

### Stats Cards (4 cards superiores)
```typescript
// DE (Mockado):
const stats = {
  totalCampaigns: 4,
  activeCampaigns: 4,
  totalStations: 12,
  todayViews: 1250,
}

// PARA (API Real):
const { data: metrics } = useQuery(['metrics', 'dashboard'], metricsService.getDashboard)
const stats = {
  totalCampaigns: metrics?.overview.total_campaigns || 0,
  activeCampaigns: metrics?.overview.total_active || 0,
  totalStations: 12, // FIXO por enquanto (solicitar endpoint)
  todayViews: 1250,  // FIXO por enquanto (solicitar endpoint)
}
```

### Atividades Recentes
```typescript
// Transformar dados de activity + campanhas recentes
const { data: activity } = useQuery(['metrics', 'activity'], () => metricsService.getActivity(7))
const { data: campaigns } = useQuery(['campaigns'], campaignsService.getAll)

const recentActivities = transformToActivities(activity, campaigns)
```

### Gráfico de Atividade (7 dias)
```typescript
// Usar dados reais de /api/metrics/activity
const { data: activity } = useQuery(['metrics', 'activity', 7], () => metricsService.getActivity(7))

const chartData = activity?.campaigns_activity.map(day => ({
  date: day.date,
  campaigns: day.campaigns_created,
  images: activity.images_activity.find(i => i.date === day.date)?.images_uploaded || 0
}))
```

### Top Campanhas
```typescript
// Direto da API
const { data: metrics } = useQuery(['metrics', 'dashboard'], metricsService.getDashboard)
const topCampaigns = metrics?.top_priority_campaigns || []
```

## 🛠️ Tarefas de Implementação

### 1. Criar Services

#### `src/services/metrics.service.ts`
```typescript
class MetricsService {
  async getDashboard() {
    // GET /api/metrics/dashboard
  }
  
  async getActivity(days: number) {
    // GET /api/metrics/activity?days={days}
  }
  
  async getStations() {
    // GET /api/metrics/stations
  }
}
```

#### `src/services/campaigns.service.ts`
```typescript
class CampaignsService {
  async getAll() {
    // GET /api/campaigns/
  }
  
  async getById(id: string) {
    // GET /api/campaigns/{id}
  }
  
  async getActive(stationId?: string) {
    // GET /api/campaigns/active/{station_id}
  }
}
```

### 2. Atualizar Dashboard

#### Modificar `src/pages/dashboard/index.tsx`
1. **Importar services e React Query**
2. **Substituir dados mockados por useQuery**
3. **Adicionar loading states com Skeleton**
4. **Adicionar error handling**
5. **Manter EXATAMENTE o mesmo JSX/Layout**

### 3. Transformadores de Dados

#### `src/lib/transformers/dashboard.ts`
```typescript
export function transformToActivities(activity, campaigns) {
  // Combinar activity + campanhas recentes
  // Retornar formato esperado pelo componente
}

export function transformChartData(activity) {
  // Formatar dados para o gráfico
}

export function calculateStats(metrics, stations) {
  // Calcular estatísticas
}
```

### 4. Loading States

Usar Skeleton do Shadcn para loading:
```typescript
if (isLoading) {
  return (
    <AppLayout>
      <DashboardSkeleton />
    </AppLayout>
  )
}
```

### 5. Error Handling

```typescript
if (error) {
  return (
    <AppLayout>
      <ErrorAlert 
        message="Erro ao carregar dashboard" 
        retry={() => refetch()}
      />
    </AppLayout>
  )
}
```

## 📦 Arquivos a Criar/Modificar

### Criar:
- `src/services/metrics.service.ts`
- `src/services/campaigns.service.ts`
- `src/lib/transformers/dashboard.ts`
- `src/components/features/dashboard/DashboardSkeleton.tsx`
- `src/components/features/dashboard/ErrorAlert.tsx`

### Modificar:
- `src/pages/dashboard/index.tsx` - Substituir dados mockados

## 🧪 Testes

### Verificar:
1. ✅ Dashboard carrega com dados reais
2. ✅ Loading state aparece enquanto busca
3. ✅ Error state se API falhar
4. ✅ Refresh funciona
5. ✅ Layout idêntico ao atual
6. ✅ Responsividade mantida
7. ✅ Performance (cache do React Query)

## 📈 Dados Temporários

Enquanto API não fornece:
- **Visualizações Hoje**: Usar 1250 (fixo) ou Math.random() * 2000
- **Total de Estações**: Usar 12 (fixo)
- **Usuário das Atividades**: Usar "Sistema" ou user.username

## 🎯 Resultado Esperado

Dashboard com:
- ✅ Mesma aparência visual
- ✅ Dados 100% reais da API
- ✅ Loading states profissionais
- ✅ Error handling robusto
- ✅ Performance com cache
- ✅ Auto-refresh configurável

## 📝 Notas

- **PRIORIDADE**: Manter layout atual
- **FILOSOFIA**: Dados reais > Dados completos
- **APPROACH**: Incremental - implementar o que existe, documentar o que falta

---

**Status**: Pronto para execução
**Dependências**: API rodando em localhost:8000
**Tempo estimado**: 2 horas