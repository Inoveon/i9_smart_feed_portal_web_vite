# 📊 Mapeamento Dashboard vs API

## ✅ O que o Dashboard Precisa vs O que a API Fornece

### 1. Cards de Estatísticas (Stats Cards)

| Dashboard Precisa | API Fornece | Endpoint | Status |
|-------------------|-------------|----------|---------|
| Total de Campanhas | `overview.total_campaigns` | `/api/metrics/dashboard` | ✅ Pronto |
| Campanhas Ativas | `overview.total_active` | `/api/metrics/dashboard` | ✅ Pronto |
| Total de Estações | `summary.total_unique_stations` | `/api/metrics/stations` | ✅ Pronto |
| Visualizações Hoje | ❌ Não existe | - | ⚠️ Falta |

### 2. Atividades Recentes

| Dashboard Precisa | API Fornece | Endpoint | Status |
|-------------------|-------------|----------|---------|
| Campanhas criadas recentemente | `campaigns_activity` | `/api/metrics/activity` | ✅ Parcial |
| Quem criou/editou | ❌ Não tem usuário | - | ⚠️ Falta |
| Tipo de atividade detalhada | ❌ Só tem data de criação | - | ⚠️ Falta |

### 3. Gráfico de Atividade (7 dias)

| Dashboard Precisa | API Fornece | Endpoint | Status |
|-------------------|-------------|----------|---------|
| Campanhas criadas por dia | `campaigns_activity` | `/api/metrics/activity` | ✅ Pronto |
| Imagens uploaded por dia | `images_activity` | `/api/metrics/activity` | ✅ Pronto |
| Edições/Updates | ❌ Não existe | - | ⚠️ Falta |

### 4. Top Campanhas por Prioridade

| Dashboard Precisa | API Fornece | Endpoint | Status |
|-------------------|-------------|----------|---------|
| Lista de campanhas prioritárias | `top_priority_campaigns` | `/api/metrics/dashboard` | ✅ Pronto |
| Nome, prioridade, estações | Todos os campos | `/api/metrics/dashboard` | ✅ Pronto |

### 5. Distribuição de Status

| Dashboard Precisa | API Fornece | Endpoint | Status |
|-------------------|-------------|----------|---------|
| Gráfico pizza com status | `overview` tem contadores | `/api/metrics/dashboard` | ✅ Pronto |
| Active, Scheduled, Paused, Expired | Todos disponíveis | `/api/metrics/dashboard` | ✅ Pronto |

## 📝 Dados que Precisamos Adaptar

### ✅ Disponíveis (só precisam formatação):
1. **Total de Campanhas** → `metrics.overview.total_campaigns`
2. **Campanhas Ativas** → `metrics.overview.total_active`
3. **Total de Estações** → Calcular de `metrics.stations` ou usar valor fixo
4. **Top Campanhas** → `metrics.top_priority_campaigns`
5. **Distribuição de Status** → Montar do `metrics.overview`
6. **Gráfico de Atividade** → `metrics.activity.campaigns_activity`

### ⚠️ Adaptações Necessárias:
1. **Visualizações Hoje** → Usar número mockado ou estático por enquanto
2. **Atividades Recentes** → Transformar `campaigns_activity` + campanhas recentes em formato de feed
3. **Usuário das atividades** → Usar usuário logado ou "Sistema" como padrão

## 🔧 Solução Proposta para o A04

### Services a Criar:

1. **`metrics.service.ts`**
   - `getDashboardMetrics()` → `/api/metrics/dashboard`
   - `getActivity(days)` → `/api/metrics/activity`
   - `getStationsMetrics()` → `/api/metrics/stations`

2. **`campaigns.service.ts`**
   - `getAll()` → `/api/campaigns/`
   - `getById(id)` → `/api/campaigns/{id}`
   - `getActive(stationId?)` → `/api/campaigns/active/{station_id}`

### Transformações de Dados:

```typescript
// Transformar para formato do Dashboard
function transformMetricsToStats(metrics) {
  return {
    totalCampaigns: metrics.overview.total_campaigns,
    activeCampaigns: metrics.overview.total_active,
    totalStations: 12, // Fixo ou calcular de stations
    todayViews: 1250, // Fixo por enquanto ou random
  }
}

// Transformar atividades
function transformToRecentActivities(activity, campaigns) {
  // Combinar dados de activity + últimas campanhas
  // Criar feed de atividades
}
```

## 📋 Solicitação para Backend (GAPS)

### Endpoints que Faltam ou Precisam Melhorias:

1. **`/api/metrics/views` ou `/api/metrics/impressions`**
   - Retornar visualizações/impressões por período
   - Necessário para "Visualizações Hoje"

2. **`/api/activity/feed` ou `/api/audit/log`**
   - Log de atividades com usuário, tipo, timestamp
   - Necessário para feed de atividades completo

3. **Melhorias em `/api/metrics/activity`:**
   - Incluir tipo de atividade (created, updated, deleted)
   - Incluir usuário que fez a ação
   - Incluir mais detalhes (nome da campanha, etc)

4. **`/api/metrics/realtime`** (opcional futuro)
   - Métricas em tempo real
   - WebSocket ou Server-Sent Events

## ✅ Conclusão

**A API já fornece 80% do que o dashboard precisa!**

Podemos implementar o dashboard com dados reais agora, usando:
- ✅ Métricas principais do `/api/metrics/dashboard`
- ✅ Atividade do `/api/metrics/activity`
- ✅ Campanhas do `/api/campaigns/`
- ⚠️ Alguns dados fixos temporários (views, user das atividades)

O A04 pode ser implementado imediatamente com estes dados!