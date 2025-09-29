# TEMPLATE PADRÃO PARA AGENTES - API FIRST

## ⚠️ REGRAS FUNDAMENTAIS - LEIA PRIMEIRO

### NUNCA FAZER:
- ❌ Criar dados mockados, exemplos ou placeholders genéricos
- ❌ Assumir campos ou endpoints sem testar
- ❌ Implementar funcionalidades que a API não suporta
- ❌ Criar services novos se já existem
- ❌ Usar valores hardcoded ou de exemplo

### SEMPRE FAZER:
- ✅ Testar TODOS os endpoints antes de implementar
- ✅ Usar APENAS dados reais da API
- ✅ Verificar o que já existe antes de criar
- ✅ Seguir rigorosamente `docs/agents/shared/REACT-VITE-STANDARDS.md`
- ✅ Documentar limitações da API

## 🔍 FASE 1 - ANÁLISE OBRIGATÓRIA (30% do tempo)

### 1.1 Verificar Código Existente
```bash
# Listar services existentes
ls src/services/

# Verificar se já existe algo relacionado
grep -r "TERMO_RELACIONADO" src/

# Verificar componentes existentes
ls src/components/
```

### 1.2 Testar Endpoints da API
```bash
# Obter token
TOKEN=$(curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" \
  2>/dev/null | jq -r '.access_token')

# Testar cada endpoint relacionado
curl -X GET "http://localhost:8000/api/ENDPOINT" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 1.3 Documentar Descobertas
```markdown
### Endpoints Disponíveis:
- GET /api/xxx - Retorna: {...}
- POST /api/xxx - Aceita: {...}

### Estrutura de Dados:
```json
// Colar resposta REAL da API
```

### Limitações Identificadas:
- API não suporta: xxx
- Campos ausentes: xxx
```

## 🛠️ FASE 2 - IMPLEMENTAÇÃO (60% do tempo)

### 2.1 Princípio: Dados Reais Sempre
```typescript
// ❌ NUNCA
const exemplo = { nome: "Exemplo", valor: 123 }
const mockData = [{ id: 1, name: "Test" }]

// ✅ SEMPRE
const { data } = useQuery({
  queryKey: ['real-data'],
  queryFn: () => service.getRealData()
})
```

### 2.2 Princípio: Reusar Código
```typescript
// Antes de criar, verificar:
// 1. Service existe? Use-o
// 2. Hook existe? Use-o
// 3. Componente similar? Adapte-o
```

### 2.3 Princípio: Honestidade sobre Limitações
```typescript
// Se API não suporta:
<Alert>
  <AlertDescription>
    Esta funcionalidade ainda não está disponível na API.
  </AlertDescription>
</Alert>

// Documentar em: docs/BACKEND-REQUEST.md
```

## ✅ FASE 3 - VALIDAÇÃO (10% do tempo)

### Checklist Final
- [ ] Zero dados mockados
- [ ] Todos endpoints testados
- [ ] Usando dados reais da API
- [ ] Reaproveitando código existente
- [ ] Limitações documentadas
- [ ] Seguindo padrões do projeto

## 📝 TEMPLATE DE NOTAS DE EXECUÇÃO

```markdown
## Execução do Agente [DATA]

### 1. Análise Inicial
- Services encontrados: xxx
- Componentes reusados: xxx
- Endpoints testados: xxx

### 2. Descobertas da API
- Endpoints funcionais: xxx
- Endpoints ausentes: xxx
- Estrutura real: [colar JSON]

### 3. Implementação
- Arquivos criados: xxx
- Arquivos modificados: xxx
- Limitações encontradas: xxx

### 4. Pendências para Backend
- [ ] Endpoint necessário: xxx
- [ ] Campo faltando: xxx
- [ ] Funcionalidade ausente: xxx
```

## 🚨 REGRA DE OURO

**Se não está na API, não invente!**
- Teste primeiro
- Use dados reais
- Documente limitações
- Seja honesto com o usuário