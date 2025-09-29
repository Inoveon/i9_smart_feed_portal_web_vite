# A07 - Gerenciamento de Estações

## ⚠️ REGRAS FUNDAMENTAIS - LEIA PRIMEIRO

### NUNCA FAZER:
- ❌ Criar dados mockados ou estruturas fictícias de estações
- ❌ Assumir campos como coordinates, displays, location
- ❌ Implementar funcionalidades sem confirmar na API
- ❌ Criar services novos sem verificar o existente
- ❌ Usar exemplos genéricos de estações

### SEMPRE FAZER:
- ✅ Testar TODOS os endpoints de estações primeiro
- ✅ Verificar estrutura real de Station da API
- ✅ Confirmar se endpoint de estações existe
- ✅ Usar apenas campos confirmados
- ✅ Seguir `docs/agents/shared/REACT-VITE-STANDARDS.md`

## 📋 Objetivo
Implementar gerenciamento de estações baseado EXCLUSIVAMENTE no que a API oferece, sem criar estruturas fictícias.

## 📚 Referências Obrigatórias
- **API Documentation**: `docs/API-DOCUMENTATION.md` - Endpoints de Estações
- **Padrões de Código**: `docs/agents/shared/REACT-VITE-STANDARDS.md`
- **Service de Campanhas**: `src/services/campaigns.service.ts` (verificar campo stations)

## 🔍 FASE 1 - ANÁLISE OBRIGATÓRIA (Executar Primeiro!)

### 1.1 Verificar Endpoints de Estações
```bash
# Obter token
TOKEN=$(curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" \
  2>/dev/null | jq -r '.access_token')

# 1. Verificar se existe endpoint de estações
curl -X GET "http://localhost:8000/api/stations" \
  -H "Authorization: Bearer $TOKEN" -w "\nStatus: %{http_code}\n"

# 2. Se não existir, verificar estações em campanhas
CAMPAIGN_ID="c0a1993a-ab05-4105-8336-d158b7c18ccb" # ID real
curl -X GET "http://localhost:8000/api/campaigns/$CAMPAIGN_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.stations'

# 3. Verificar se existe endpoint de disponibilidade
curl -X GET "http://localhost:8000/api/stations/available" \
  -H "Authorization: Bearer $TOKEN" -w "\nStatus: %{http_code}\n"

# 4. Verificar estrutura de estação (se existir)
curl -X GET "http://localhost:8000/api/stations/001" \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Verificar estatísticas de estação
curl -X GET "http://localhost:8000/api/stations/001/statistics" \
  -H "Authorization: Bearer $TOKEN" -w "\nStatus: %{http_code}\n"
```

### 1.2 Verificar Estrutura no Campaigns Service
```bash
# Ver como estações são tratadas atualmente
grep -n "stations" src/services/campaigns.service.ts

# Ver tipo de dados usado
grep -n "string\[\]" src/services/campaigns.service.ts
```

### 1.3 Documentar Descobertas
```typescript
// ANOTAR estrutura REAL encontrada
// Se API tem endpoint de estações:
interface StationFromAPI {
  // Apenas campos CONFIRMADOS
}

// Se API NÃO tem endpoint de estações:
// Documentar que estações são apenas strings[]
```

## 🛠️ FASE 2 - IMPLEMENTAÇÃO

### 2.1 Decidir Estratégia

**SE a API tem endpoint /stations:**
- Implementar service completo
- Usar estrutura real confirmada

**SE a API NÃO tem endpoint /stations:**
- Documentar em `docs/BACKEND-REQUEST.md`
- Implementar APENAS seletor simples de strings
- NÃO criar estrutura fictícia de Station

### 2.2 Seletor de Estações (BÁSICO)

Se API não tem gerenciamento completo:
```typescript
// src/components/features/StationSelector.tsx

// APENAS se confirmado que stations são strings
export function StationSelector({ 
  value, 
  onChange 
}: { 
  value: string[], 
  onChange: (value: string[]) => void 
}) {
  // Lista simples de códigos de estação
  // NÃO inventar campos como name, location, etc
  const availableStations = ['001', '002', '003'] // Valores REAIS da API
  
  return (
    <div>
      {availableStations.map(station => (
        <Checkbox 
          key={station}
          checked={value.includes(station)}
          onCheckedChange={(checked) => {
            if (checked) {
              onChange([...value, station])
            } else {
              onChange(value.filter(s => s !== station))
            }
          }}
        >
          Estação {station}
        </Checkbox>
      ))}
    </div>
  )
}
```

### 2.3 Conceito de Campanha Global

```typescript
// IMPORTANTE: Verificar PRIMEIRO como API trata isso
// Opção 1: stations: [] significa todas
// Opção 2: existe campo all_stations: true
// Opção 3: stations: null significa todas

// Implementar conforme API real
const isGlobalCampaign = campaign.stations?.length === 0
// ou
const isGlobalCampaign = campaign.all_stations === true
```

### 2.4 Se API tem Gerenciamento Completo

```typescript
// src/services/stations.service.ts

// APENAS criar se confirmado endpoint existe
// Usar estrutura EXATA da API
class StationsService {
  async getAll() {
    // Testar primeiro se funciona
  }
}
```

### 2.5 Integração com Campanhas

```typescript
// No formulário de campanha
// Usar estrutura REAL confirmada

const form = useForm({
  defaultValues: {
    name: '',
    description: '',
    stations: [] as string[], // ou conforme API
  }
})

// NÃO assumir campos complexos sem confirmar
```

## ✅ Checklist de Validação

### Antes de Começar
- [ ] Testei endpoint GET /api/stations
- [ ] Verifiquei campo stations em campanhas
- [ ] Confirmei tipo de dados (string[] ou objeto)
- [ ] Entendi conceito de campanha global
- [ ] Verifiquei se existe gerenciamento completo

### Durante Implementação
- [ ] Usando APENAS estrutura confirmada
- [ ] Sem campos inventados
- [ ] Sem dados de exemplo
- [ ] Integrando com estrutura real de Campaign

### Depois de Implementar
- [ ] Seleção de estações funciona
- [ ] Dados salvos corretamente na campanha
- [ ] Campanha global funciona (se suportado)
- [ ] Sem funcionalidades falsas

## 📊 Resultado Esperado
- Seletor de estações funcional
- Apenas features que a API suporta
- Integração correta com campanhas
- Sem estruturas fictícias

## 🚨 IMPORTANTE

### Se API não tem gerenciamento de estações:
```typescript
// Implementar apenas o básico
<Alert>
  <AlertDescription>
    Gerenciamento avançado de estações não disponível.
    Use os códigos de estação diretamente.
  </AlertDescription>
</Alert>
```

### Se API tem estrutura diferente:
- Adaptar para estrutura real
- Não forçar campos que não existem
- Documentar limitações

## 📝 Notas de Execução
O agente deve preencher durante execução:

```markdown
### Endpoints Testados:
- [ ] GET /api/stations - Status: ___
- [ ] GET /api/stations/{id} - Status: ___
- [ ] GET /api/stations/available - Status: ___
- [ ] GET /api/campaigns/{id} - stations field: ___

### Estrutura Confirmada:
```json
// Colar estrutura REAL aqui
```

### Tipo de Estação:
- [ ] Array de strings (códigos)
- [ ] Array de objetos complexos
- [ ] Outro: ___

### Conceito de Campanha Global:
- [ ] stations: [] = todas
- [ ] all_stations: true
- [ ] Não suportado

### Funcionalidades Disponíveis:
- [ ] Listagem de estações
- [ ] Detalhes de estação
- [ ] Estatísticas
- [ ] Verificação de disponibilidade
- [ ] Apenas códigos simples
```