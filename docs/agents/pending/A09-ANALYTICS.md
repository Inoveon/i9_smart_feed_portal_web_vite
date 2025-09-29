# A09 - Analytics e Relatórios

## ⚠️ REGRAS FUNDAMENTAIS - LEIA PRIMEIRO

### NUNCA FAZER:
- ❌ Criar métricas falsas ou valores mockados
- ❌ Assumir endpoints de analytics sem testar
- ❌ Implementar gráficos sem dados reais
- ❌ Inventar taxas de engajamento ou performance
- ❌ Usar bibliotecas de gráfico sem verificar necessidade

### SEMPRE FAZER:
- ✅ Testar endpoints de métricas e analytics primeiro
- ✅ Verificar estrutura real dos dados analíticos
- ✅ Usar apenas métricas que a API fornece
- ✅ Confirmar formato de exportação disponível
- ✅ Seguir `docs/agents/shared/REACT-VITE-STANDARDS.md`

## 📋 Objetivo
Implementar sistema de analytics baseado EXCLUSIVAMENTE nos dados reais que a API fornece, sem criar métricas fictícias.

## 📚 Referências Obrigatórias
- **API Documentation**: `docs/API-DOCUMENTATION.md` - Endpoints de Analytics/Metrics
- **Padrões de Código**: `docs/agents/shared/REACT-VITE-STANDARDS.md`
- **Service de Métricas**: `src/services/metrics.service.ts` (já existente)

## 🔍 FASE 1 - ANÁLISE OBRIGATÓRIA (Executar Primeiro!)

### 1.1 Verificar Endpoints de Analytics
```bash
# Obter token
TOKEN=$(curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" \
  2>/dev/null | jq -r '.access_token')

# 1. Verificar endpoint de métricas gerais
curl -X GET "http://localhost:8000/api/metrics/dashboard" \
  -H "Authorization: Bearer $TOKEN" | jq

# 2. Verificar endpoint de atividades
curl -X GET "http://localhost:8000/api/metrics/activity?days=7" \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Verificar se existe endpoint de analytics
curl -X GET "http://localhost:8000/api/analytics" \
  -H "Authorization: Bearer $TOKEN" -w "\nStatus: %{http_code}\n"

# 4. Verificar se existe endpoint de relatórios
curl -X GET "http://localhost:8000/api/reports" \
  -H "Authorization: Bearer $TOKEN" -w "\nStatus: %{http_code}\n"

# 5. Verificar se existe exportação
curl -X GET "http://localhost:8000/api/metrics/export" \
  -H "Authorization: Bearer $TOKEN" -w "\nStatus: %{http_code}\n"

# 6. Verificar métricas por campanha
CAMPAIGN_ID="c0a1993a-ab05-4105-8336-d158b7c18ccb" # ID real
curl -X GET "http://localhost:8000/api/campaigns/$CAMPAIGN_ID/metrics" \
  -H "Authorization: Bearer $TOKEN" | jq

# 7. Verificar métricas por estação
curl -X GET "http://localhost:8000/api/metrics/stations" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 1.2 Verificar Service Existente
```bash
# Ver o que já existe implementado
cat src/services/metrics.service.ts

# Ver métodos disponíveis
grep -n "async" src/services/metrics.service.ts
```

### 1.3 Documentar Métricas Disponíveis
```typescript
// ANOTAR apenas métricas CONFIRMADAS na API
interface RealMetrics {
  // Apenas campos que REALMENTE existem
  total_campaigns?: number
  active_campaigns?: number
  // NÃO assumir impressions, reach, engagement_rate, etc
}
```

## 🛠️ FASE 2 - IMPLEMENTAÇÃO

### 2.1 Decidir Estratégia

**SE a API tem analytics completo:**
- Implementar visualizações com dados reais
- Usar estrutura confirmada

**SE a API tem apenas métricas básicas:**
- Mostrar apenas o que existe
- NÃO inventar métricas adicionais
- Documentar limitações em `docs/BACKEND-REQUEST.md`

### 2.2 Cards de Métricas (BÁSICO)

```typescript
// src/pages/analytics/index.tsx

export function AnalyticsPage() {
  // Usar service EXISTENTE
  const { data: metrics } = useQuery({
    queryKey: ['metrics', 'dashboard'],
    queryFn: metricsService.getDashboard
  })
  
  // Mostrar APENAS métricas reais
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        
        {/* Cards com dados REAIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {metrics?.overview && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Total de Campanhas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {metrics.overview.total_campaigns || 0}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Campanhas Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {metrics.overview.total_active || 0}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        
        {/* Se não tem mais métricas, informar */}
        {!metrics?.impressions && (
          <Alert>
            <AlertDescription>
              Métricas detalhadas de visualização ainda não estão disponíveis.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AppLayout>
  )
}
```

### 2.3 Gráfico de Atividade (SE existir)

```typescript
// APENAS se confirmado que API retorna dados de atividade

export function ActivityChart() {
  const { data: activity } = useQuery({
    queryKey: ['metrics', 'activity', 7],
    queryFn: () => metricsService.getActivity(7)
  })
  
  // Verificar estrutura REAL
  if (!activity?.campaigns_activity) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Dados de atividade não disponíveis
          </p>
        </CardContent>
      </Card>
    )
  }
  
  // Usar dados REAIS para gráfico
  const chartData = activity.campaigns_activity.map(day => ({
    date: day.date,
    campanhas: day.campaigns_created || 0
    // NÃO inventar outros campos
  }))
  
  // Implementar gráfico simples com dados reais
}
```

### 2.4 Tabela de Performance (SE existir)

```typescript
// APENAS implementar se API fornece dados de performance

export function PerformanceTable() {
  // Verificar primeiro se existe endpoint
  const { data: stations } = useQuery({
    queryKey: ['metrics', 'stations'],
    queryFn: metricsService.getStations
  })
  
  if (!stations) {
    return null // Não mostrar tabela vazia
  }
  
  // Usar estrutura REAL confirmada
}
```

### 2.5 Exportação (SE suportada)

```typescript
// APENAS se API suporta exportação

const handleExport = async () => {
  // Testar primeiro se endpoint existe
  try {
    const response = await api.get('/metrics/export')
    // Implementar download
  } catch (error) {
    toast.error('Exportação ainda não disponível')
  }
}
```

### 2.6 Instalação de Bibliotecas

```bash
# APENAS instalar se confirmar necessidade

# Se tiver gráficos simples de linha/barra:
npm install recharts

# NÃO instalar se não for usar:
# - chart.js
# - jspdf
# - react-to-print
```

## ✅ Checklist de Validação

### Antes de Começar
- [ ] Testei endpoint /api/metrics/dashboard
- [ ] Testei endpoint /api/metrics/activity
- [ ] Verifiquei se existe /api/analytics
- [ ] Confirmei métricas disponíveis
- [ ] Entendi limitações da API

### Durante Implementação
- [ ] Usando APENAS métricas reais
- [ ] Sem valores mockados ou estimados
- [ ] Tratando ausência de dados apropriadamente
- [ ] Reusando service existente

### Depois de Implementar
- [ ] Métricas mostram dados reais
- [ ] Gráficos apenas com dados disponíveis
- [ ] Mensagens claras sobre limitações
- [ ] Sem funcionalidades falsas

## 📊 Resultado Esperado
- Página de analytics funcional
- Apenas métricas que existem na API
- Interface clara sobre limitações
- Sem dados simulados

## 🚨 IMPORTANTE

### Se API tem poucas métricas:
```typescript
// Ser honesto sobre limitações
<Alert>
  <AlertDescription>
    Sistema de analytics completo em desenvolvimento.
    Atualmente disponível: total de campanhas e status.
  </AlertDescription>
</Alert>
```

### Se não tem gráficos:
- Mostrar dados em cards ou tabelas
- NÃO criar gráficos vazios
- Documentar necessidade em BACKEND-REQUEST.md

## 📝 Notas de Execução
O agente deve preencher durante execução:

```markdown
### Endpoints Testados:
- [ ] GET /api/metrics/dashboard - Status: ___
- [ ] GET /api/metrics/activity - Status: ___
- [ ] GET /api/analytics - Status: ___
- [ ] GET /api/reports - Status: ___
- [ ] GET /api/metrics/export - Status: ___
- [ ] GET /api/campaigns/{id}/metrics - Status: ___
- [ ] GET /api/metrics/stations - Status: ___

### Métricas Disponíveis:
```json
// Colar estrutura REAL aqui
```

### Dados para Gráficos:
- [ ] Atividade temporal: ___
- [ ] Performance por estação: ___
- [ ] Métricas por campanha: ___
- [ ] Outros: ___

### Funcionalidades Possíveis:
- [ ] Cards de métricas básicas
- [ ] Gráfico de atividade
- [ ] Tabela de campanhas
- [ ] Exportação de dados
- [ ] Comparação temporal
```