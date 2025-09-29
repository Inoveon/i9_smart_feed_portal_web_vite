# A08 - Sistema de Preview e Padrão de Layout de Listagem

## 📐 PADRÃO DE LAYOUT DE LISTAGEM (IMPLEMENTADO)

### Estrutura Padrão para Todas as Páginas de Listagem
Este padrão foi implementado em **Branches**, **Stations** e **Campaigns** e deve ser seguido em todas as novas páginas:

#### 1. Estrutura de Imports
```typescript
import { useMemo, useState } from 'react'
import { AppLayout } from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/features/page/PageHeader'
import { DataTableShell } from '@/components/features/table/DataTableShell'
import { PaginationBar } from '@/components/features/table/PaginationBar'
import { ErrorBoundary } from '@/components/features/ErrorBoundary'
// Services e hooks específicos
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
```

#### 2. Estrutura do Componente
```typescript
export function EntityPage() {
  // Server-side pagination params (SEMPRE este comentário)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  // Estados de filtros
  const [search, setSearch] = useState('')
  // Outros filtros conforme necessário
  
  // Hooks de dados
  const { data, isLoading, error, refetch, isFetching } = useEntityList({
    page,
    limit,
    search,
    // outros filtros
  })
  const totalPages = data ? data.total_pages : 1
  const items = data ? data.items : []
```

#### 3. Layout da Página
```typescript
return (
  <AppLayout>
    <ErrorBoundary>
    <div className="container mx-auto p-6 space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Título da Página"
        description="Descrição da funcionalidade"
        primaryAction={{ label: 'Novo Item', icon: Plus, to: '/route/new' }}
      />

      {/* 2. Card com Listagem */}
      <Card>
        <CardHeader>
          <CardTitle>Listagem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 3. Toolbar de Filtros */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9"
              />
            </div>
            {/* Filtros adicionais como Select */}
          </div>

          {/* 4. Área com Scroll Interno */}
          <div className="relative max-h-[60vh] overflow-y-auto">
            <div className="overflow-x-auto">
              <DataTableShell isLoading={isLoading} error={error as any} itemsLength={items.length} onRetry={()=>refetch()}>
                <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    {/* Colunas */}
                    <th className="py-2 pr-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/40">
                      {/* Células de dados */}
                      <td className="py-2 pr-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Botões de ação sempre com variant="ghost" e size="icon" */}
                          <Button asChild size="icon" variant="ghost" title="Editar">
                            <Link to={`/route/${item.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button size="icon" variant="ghost" title="Excluir" onClick={() => handleDelete(item.id, item.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </DataTableShell>
            </div>
            {/* 5. Paginação Sticky */}
            <div className="sticky bottom-0 bg-background pt-2">
              <PaginationBar
                page={page}
                totalPages={totalPages || 1}
                limit={limit}
                onPrev={()=>setPage(p => Math.max(1, p-1))}
                onNext={()=>setPage(p => p+1)}
                onLimitChange={(n)=>{ setLimit(n); setPage(1) }}
                isFetching={isFetching}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </ErrorBoundary>
  </AppLayout>
)
```

#### 4. Padrões de Estilo
- **Cores**: Sempre usar variáveis de tema (bg-background, text-foreground, etc)
- **Espaçamento**: `space-y-6` entre seções, `space-y-4` dentro de cards
- **Tabela**: 
  - Headers com `text-left border-b`
  - Células com `py-2 pr-4`
  - Hover com `hover:bg-muted/40`
  - Ações sempre alinhadas à direita com `text-right` e `justify-end`
- **Scroll**: `max-h-[60vh]` para área de lista
- **Paginação**: Sempre sticky dentro da área de scroll

#### 5. Funcionalidades Padrão
- **Delete com confirmação nativa**: `if (!confirm(...)) return`
- **Toast de feedback**: Usar `toast.success()` e `toast.error()`
- **Loading/Error**: Tratados pelo DataTableShell
- **Filtros resetam página**: Sempre `setPage(1)` ao mudar filtros

#### 6. Especificidades por Tipo
- **Campanhas**: Adiciona botão de Imagens (ImageIcon) antes de Editar
- **Branches/Stations**: Podem ter filtros de região/estado
- **Código em células**: Usar `font-mono text-xs`

## ⚠️ REGRAS FUNDAMENTAIS - LEIA PRIMEIRO

### NUNCA FAZER:
- ❌ Criar exemplos de imagens ou URLs mockadas
- ❌ Assumir estrutura de CampaignImage sem testar
- ❌ Implementar animações sem verificar se imagens existem
- ❌ Criar funcionalidades de ordenação se API não suporta
- ❌ Usar dados de teste ou placeholder

### SEMPRE FAZER:
- ✅ Verificar se campanhas têm imagens na API
- ✅ Testar estrutura real de imagens primeiro
- ✅ Usar apenas URLs reais de imagens
- ✅ Confirmar se existe ordenação de imagens
- ✅ Seguir `docs/agents/shared/REACT-VITE-STANDARDS.md`

## 📋 Objetivo
Implementar sistema de preview baseado EXCLUSIVAMENTE nas imagens reais que a API retorna para cada campanha.

## 📚 Referências Obrigatórias
- **API Documentation**: `docs/API-DOCUMENTATION.md` - Endpoints de Campanhas e Imagens
- **Padrões de Código**: `docs/agents/shared/REACT-VITE-STANDARDS.md`
- **Service de Campanhas**: `src/services/campaigns.service.ts`

## 🔍 FASE 1 - ANÁLISE OBRIGATÓRIA (Executar Primeiro!)

### 1.1 Verificar Estrutura de Imagens
```bash
# Obter token
TOKEN=$(curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" \
  2>/dev/null | jq -r '.access_token')

# 1. Buscar campanha com imagens
CAMPAIGN_ID="c0a1993a-ab05-4105-8336-d158b7c18ccb" # ID real
curl -X GET "http://localhost:8000/api/campaigns/$CAMPAIGN_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.images'

# 2. Verificar endpoint de imagens separado (se existir)
curl -X GET "http://localhost:8000/api/campaigns/$CAMPAIGN_ID/images" \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Verificar estrutura de uma imagem
curl -X GET "http://localhost:8000/api/images/{id}" \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Verificar se tem ordenação
curl -X PUT "http://localhost:8000/api/campaigns/$CAMPAIGN_ID/images/order" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[]' -w "\nStatus: %{http_code}\n"
```

### 1.2 Verificar Campos Reais
```typescript
// ANOTAR exatamente o que API retorna
interface ImageFromAPI {
  id?: string
  url?: string      // ou path?
  filename?: string // ou name?
  order?: number    // existe?
  // NÃO assumir width, height, duration, etc
}
```

### 1.3 Verificar Service Existente
```bash
# Ver se já existe tratamento de imagens
grep -n "images" src/services/campaigns.service.ts
```

## 🛠️ FASE 2 - IMPLEMENTAÇÃO

### 2.1 Decidir Estratégia

**SE campanhas têm imagens:**
- Implementar preview com imagens reais
- Usar estrutura confirmada

**SE campanhas NÃO têm imagens ainda:**
- Mostrar placeholder apropriado
- Documentar em `docs/BACKEND-REQUEST.md`
- NÃO criar preview falso

### 2.2 Componente de Preview Básico

```typescript
// src/components/features/CampaignPreview.tsx

export function CampaignPreview({ campaignId }: { campaignId: string }) {
  // Buscar dados REAIS
  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignsService.getById(campaignId)
  })
  
  // Verificar se tem imagens
  if (!campaign?.images || campaign.images.length === 0) {
    return (
      <div className="bg-muted rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          Esta campanha não possui imagens
        </p>
      </div>
    )
  }
  
  // Preview simples com dados REAIS
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentImage = campaign.images[currentIndex]
  
  return (
    <div className="space-y-4">
      {/* Imagem atual */}
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <img 
          src={currentImage.url || currentImage.path} // usar campo REAL
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Navegação apenas se múltiplas imagens */}
      {campaign.images.length > 1 && (
        <div className="flex gap-2">
          <Button 
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            {currentIndex + 1} / {campaign.images.length}
          </span>
          <Button 
            onClick={() => setCurrentIndex(Math.min(campaign.images.length - 1, currentIndex + 1))}
            disabled={currentIndex === campaign.images.length - 1}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}
```

### 2.3 Preview com Auto-play (SE tiver imagens)

```typescript
// APENAS implementar se confirmado que tem imagens

export function AutoPlayPreview({ images }: { images: any[] }) {
  const [playing, setPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Auto-advance apenas se confirmado múltiplas imagens
  useEffect(() => {
    if (!playing || images.length <= 1) return
    
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 5000) // 5 segundos por imagem
    
    return () => clearTimeout(timer)
  }, [currentIndex, playing, images.length])
  
  // Resto da implementação com dados REAIS
}
```

### 2.4 Miniaturas (SE existirem imagens)

```typescript
// Mostrar grid de miniaturas APENAS com imagens reais

{campaign.images && campaign.images.length > 0 && (
  <div className="grid grid-cols-6 gap-2">
    {campaign.images.map((image, index) => (
      <button
        key={image.id || index}
        onClick={() => setCurrentIndex(index)}
        className={cn(
          "aspect-video rounded overflow-hidden border-2",
          currentIndex === index ? "border-primary" : "border-transparent"
        )}
      >
        <img 
          src={image.url || image.path}
          alt=""
          className="w-full h-full object-cover"
        />
      </button>
    ))}
  </div>
)}
```

### 2.5 Instalação de Dependências

```bash
# APENAS instalar se for usar animações confirmadas
# Verificar primeiro se campanhas têm imagens

# Se confirmar necessidade:
npm install framer-motion  # apenas para transições
```

## ✅ Checklist de Validação

### Antes de Começar
- [ ] Verifiquei se campanhas têm imagens
- [ ] Testei estrutura real de imagem
- [ ] Confirmei campos disponíveis (url, path, etc)
- [ ] Verifiquei se existe ordenação
- [ ] Entendi limitações da API

### Durante Implementação
- [ ] Usando APENAS imagens reais da API
- [ ] Sem URLs de exemplo ou placeholder
- [ ] Tratando caso sem imagens apropriadamente
- [ ] Navegação funciona com dados reais

### Depois de Implementar
- [ ] Preview mostra imagens reais
- [ ] Navegação entre imagens funciona
- [ ] Caso sem imagens bem tratado
- [ ] Sem animações desnecessárias

## 📊 Resultado Esperado
- Preview funcional com imagens reais
- Interface clara quando não há imagens
- Navegação simples e eficiente
- Sem dados simulados

## 🚨 IMPORTANTE

### Se campanha não tem imagens:
```typescript
// Mensagem clara, não simular
<Alert>
  <AlertDescription>
    Adicione imagens à campanha para visualizar o preview
  </AlertDescription>
</Alert>
```

### Se estrutura é diferente:
- Adaptar aos campos reais
- Não assumir campos que não existem
- Documentar diferenças

## 📝 Notas de Execução
O agente deve preencher durante execução:

```markdown
### Endpoints Testados:
- [ ] GET /api/campaigns/{id} - tem images?: ___
- [ ] GET /api/campaigns/{id}/images - Status: ___
- [ ] GET /api/images/{id} - Status: ___
- [ ] PUT /api/campaigns/{id}/images/order - Status: ___

### Estrutura de Imagem Confirmada:
```json
// Colar estrutura REAL aqui
```

### Campos Disponíveis:
- [ ] id
- [ ] url ou path?
- [ ] filename ou name?
- [ ] order ou position?
- [ ] Outros: ___

### Funcionalidades Possíveis:
- [ ] Mostrar imagem única
- [ ] Navegar entre múltiplas
- [ ] Auto-play
- [ ] Reordenação
- [ ] Preview em tela cheia
```