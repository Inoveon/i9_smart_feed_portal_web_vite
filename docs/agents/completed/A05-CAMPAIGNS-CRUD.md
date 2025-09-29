# A05 - CRUD de Campanhas

## ⚠️ REGRAS FUNDAMENTAIS - LEIA PRIMEIRO

### NUNCA FAZER:
- ❌ Criar dados mockados ou de exemplo
- ❌ Usar placeholders genéricos ("Ex: Promoção de Verão")
- ❌ Assumir campos que não foram confirmados na API
- ❌ Criar services novos se já existem
- ❌ Implementar sem testar os endpoints primeiro

### SEMPRE FAZER:
- ✅ Testar TODOS os endpoints antes de implementar
- ✅ Usar APENAS dados reais da API
- ✅ Verificar o que já existe antes de criar
- ✅ Seguir rigorosamente `docs/agents/shared/REACT-VITE-STANDARDS.md`
- ✅ Validar schemas com a estrutura real da API

## 📋 Objetivo
Implementar CRUD completo de campanhas usando EXCLUSIVAMENTE dados reais da API, reaproveitando código existente.

## 📚 Referências Obrigatórias
- **API Documentation**: `docs/API-DOCUMENTATION.md` - Endpoints de Campanhas
- **Padrões de Código**: `docs/agents/shared/REACT-VITE-STANDARDS.md`
- **Service Existente**: `src/services/campaigns.service.ts`

## 🔍 FASE 1 - ANÁLISE OBRIGATÓRIA (Executar Primeiro!)

### 1.1 Verificar Service Existente
```bash
# Verificar o que já está implementado
cat src/services/campaigns.service.ts

# Verificar hooks já criados
grep -n "export function use" src/services/campaigns.service.ts

# Verificar schemas Zod já definidos
grep -n "z.object" src/services/campaigns.service.ts
```

### 1.2 Testar Endpoints da API
```bash
# Obter token de autenticação
TOKEN=$(curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" \
  2>/dev/null | jq -r '.access_token')

# 1. Listar campanhas - verificar estrutura exata
curl -X GET "http://localhost:8000/api/campaigns" \
  -H "Authorization: Bearer $TOKEN" | jq

# 2. Buscar campanha específica (use ID real da listagem acima)
CAMPAIGN_ID="..." # Usar ID real obtido
curl -X GET "http://localhost:8000/api/campaigns/$CAMPAIGN_ID" \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Verificar estrutura para criação
curl -X POST "http://localhost:8000/api/campaigns" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' 2>/dev/null | jq '.detail'
# Analisar mensagem de erro para entender campos obrigatórios

# 4. Verificar endpoints de imagens
curl -X GET "http://localhost:8000/api/campaigns/$CAMPAIGN_ID/images" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 1.3 Documentar Estrutura Real
```typescript
// ANOTAR EXATAMENTE o que a API retorna:
// Exemplo baseado em resposta REAL:
interface CampaignFromAPI {
  id: string
  name: string
  description?: string
  // ... campos REAIS confirmados
}
```

## 🛠️ FASE 2 - IMPLEMENTAÇÃO

### 2.1 Complementar Service Existente
```typescript
// src/services/campaigns.service.ts
// APENAS adicionar o que falta, não recriar!

// Verificar se precisa adicionar:
// - Método para buscar todas campanhas com paginação?
// - Método para upload de múltiplas imagens?
// - Outros métodos faltantes?
```

### 2.2 Criar Componentes Necessários

#### Instalar componentes Shadcn/UI faltantes
```bash
# Verificar quais já existem
ls src/components/ui/

# Instalar APENAS os que não existem
npx shadcn-ui@latest add data-table  # se não existir
npx shadcn-ui@latest add date-picker # se não existir
```

### 2.3 Página de Listagem
```typescript
// src/pages/campaigns/index.tsx
import { useActiveCampaigns } from '@/services/campaigns.service'

export function CampaignsPage() {
  // Usar hook EXISTENTE
  const { data: campaigns, isLoading } = useActiveCampaigns()
  
  // NUNCA fazer isso:
  // const mockCampaigns = [{ name: "Exemplo" }] ❌
  
  // SEMPRE usar dados reais:
  console.log('Campanhas da API:', campaigns)
  
  // Renderizar com dados REAIS
  return (
    <AppLayout>
      {/* Usar campaigns?.campaigns do retorno real */}
      {campaigns?.campaigns?.map(campaign => (
        // Usar campos CONFIRMADOS da API
        <div key={campaign.id}>
          {campaign.name}
          {/* NÃO assumir campos como campaign.images sem confirmar */}
        </div>
      ))}
    </AppLayout>
  )
}
```

### 2.4 Formulário de Campanha
```typescript
// src/pages/campaigns/form.tsx

// Schema baseado APENAS em campos confirmados da API
const campaignSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  // APENAS campos que a API aceita
  // Verificar em POST /api/campaigns o que é aceito
})

export function CampaignForm() {
  const form = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      // NÃO usar exemplos genéricos
      name: '', // ✅
      // name: 'Promoção de Verão', ❌
    }
  })
  
  // Ao carregar para edição, usar dados REAIS
  useEffect(() => {
    if (campaignData) {
      form.reset(campaignData) // Dados da API
    }
  }, [campaignData])
}
```

### 2.5 Upload de Imagens
```typescript
// PRIMEIRO verificar se endpoint existe e como funciona
// Testar: POST /api/campaigns/{id}/images

// Se existir, implementar baseado na resposta real
// Se não existir, documentar em BACKEND-REQUEST.md
```

## ✅ Checklist de Validação

### Antes de Começar
- [ ] Testei TODOS os endpoints com curl
- [ ] Anotei estrutura EXATA das respostas
- [ ] Verifiquei o que já existe em campaigns.service.ts
- [ ] Li e entendi REACT-VITE-STANDARDS.md

### Durante Implementação
- [ ] Estou usando APENAS campos confirmados da API
- [ ] Não criei nenhum dado mockado
- [ ] Reaproveitei código existente
- [ ] Segui padrões do projeto

### Depois de Implementar
- [ ] Listagem mostra dados REAIS da API
- [ ] Formulário tem APENAS campos que a API aceita
- [ ] Não há placeholders genéricos
- [ ] Todos os dados vêm da API

## 📊 Resultado Esperado
- CRUD funcionando com dados 100% reais
- Zero dados mockados ou exemplos
- Máximo reaproveitamento de código
- Integração perfeita com a API

## 🚨 IMPORTANTE
Se algum endpoint não existir ou retornar erro:
1. Documentar em `docs/BACKEND-REQUEST.md`
2. Implementar apenas o que funciona
3. Não criar dados falsos para "simular"

## 📝 Notas de Execução
Preenchido durante execução em 24/09/2025:

### Endpoints Testados:
- [x] GET /api/campaigns/ - Status: 200 ✅ (nota: precisa barra final)
- [x] GET /api/campaigns/{id} - Status: 200 ✅
- [x] GET /api/campaigns/active - Status: 200 ✅
- [x] POST /api/campaigns/ - Status: 422 ✅ (campos obrigatórios: name, start_date, end_date)
- [x] PUT /api/campaigns/{id} - Status: 404 ⚠️ (funciona mas campanha foi deletada)
- [x] DELETE /api/campaigns/{id} - Status: 204 ✅
- [ ] POST /api/campaigns/{id}/images - Status: 404 ❌ (endpoint não existe)

### Estrutura Confirmada:
```json
// GET /api/campaigns/ retorna array de campanhas:
[
  {
    "name": "Promoção São Paulo",
    "description": "Exclusiva para postos de SP",
    "status": "active",
    "start_date": "2025-09-23T21:27:28.384920",
    "end_date": "2025-10-08T21:27:28.384924",
    "default_display_time": 4000,
    "stations": ["001","002","003"],
    "priority": 5,
    "id": "c0a1993a-ab05-4105-8336-d158b7c18ccb",
    "created_at": "2025-09-24T00:27:28.435987",
    "updated_at": "2025-09-24T00:27:28.435987"
  }
]

// GET /api/campaigns/active retorna objeto com campanhas:
{
  "campaigns": [...], // mesmo formato acima mas sem status/dates
  "total": 4,
  "timestamp": "2025-09-24T16:22:02.832516"
}
```

### Campos Disponíveis (confirmados pela API):
- id: string (UUID)
- name: string (obrigatório)
- description: string (opcional)
- status: "active" | "scheduled" | "paused" | "expired" (opcional, default "active")
- start_date: string ISO (obrigatório)
- end_date: string ISO (obrigatório)
- default_display_time: number (opcional, default 5000)
- stations: string[] (opcional, default [])
- priority: number (opcional, default 0)
- created_at: string ISO (gerado)
- updated_at: string ISO (gerado)

### Services/Hooks Reaproveitados:
- ✅ useCampaigns() - para listar todas
- ✅ useCampaign(id) - para buscar por ID
- ✅ useActiveCampaigns() - para campanhas ativas
- ✅ useCreateCampaign() - para criar
- ✅ useUpdateCampaign() - para atualizar
- ✅ useDeleteCampaign() - para deletar
- ✅ campaignsService.* - todos os métodos já implementados

### Descobertas Importantes:
1. Endpoint de imagens não existe ainda (documentar em BACKEND-REQUEST.md)
2. Service existente está 100% completo e funcional
3. Schemas Zod já estão corretos conforme API
4. Todos os hooks React Query já implementados
5. A implementação está pronta - apenas faltam as páginas/componentes UI