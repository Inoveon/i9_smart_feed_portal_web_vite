# 📐 PADRÕES DE DESENVOLVIMENTO - i9 Smart Campaigns Portal (Vite + React + Shadcn/UI)

## 🚨 REGRAS ABSOLUTAS - NUNCA QUEBRAR

### 1. Componentes UI
```typescript
// ✅ SEMPRE usar componentes de @/components/ui/
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// ❌ NUNCA criar componentes que já existem
// ❌ NUNCA usar HTML direto quando há componente UI
<button>Click</button> // ❌ ERRADO
<Button>Click</Button>  // ✅ CORRETO
```

### 2. Layout Padrão
```typescript
// ✅ SEMPRE usar layouts padrão
function PageName() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        {/* conteúdo */}
      </div>
    </AppLayout>
  )
}

// ❌ NUNCA criar estruturas de layout customizadas
```

### 3. Estilização - APENAS Tailwind
```typescript
// ✅ SEMPRE usar classes Tailwind
<div className="flex items-center gap-4 p-4 bg-background">

// ❌ NUNCA usar:
style={{}}           // ❌ Inline styles
styled.div``         // ❌ Styled components  
styles.module.css    // ❌ CSS Modules
<style jsx>          // ❌ CSS-in-JS
```

### 4. Cores - APENAS Variáveis de Tema
```typescript
// ✅ SEMPRE usar variáveis CSS do tema
className="bg-primary text-primary-foreground"
className="border-border bg-background"
className="text-muted-foreground"

// ❌ NUNCA hardcode cores
className="bg-blue-500"      // ❌
style={{ color: '#3B82F6' }} // ❌
className="text-[#fff]"       // ❌
```

### 5. API Calls - APENAS React Query
```typescript
// ✅ SEMPRE usar React Query
const { data, isLoading } = useQuery({
  queryKey: ['campaigns'],
  queryFn: campaignsService.getAll
})

// ❌ NUNCA fazer fetch direto
useEffect(() => {
  fetch('/api/campaigns')  // ❌ ERRADO
}, [])

// ❌ NUNCA usar axios direto em componentes
const data = await axios.get() // ❌ ERRADO
```

### 6. Estado Global - APENAS Zustand
```typescript
// ✅ SEMPRE usar Zustand para estado global
const user = useAuthStore(state => state.user)

// ❌ NUNCA usar:
Redux        // ❌
Context API  // ❌ (exceto para tema)
MobX         // ❌
```

### 7. Formulários - APENAS React Hook Form + Zod
```typescript
// ✅ SEMPRE usar React Hook Form com Zod
const form = useForm({
  resolver: zodResolver(schema)
})

// ❌ NUNCA gerenciar formulários manualmente
const [name, setName] = useState('')  // ❌ ERRADO
```

### 8. Roteamento - APENAS React Router v6
```typescript
// ✅ SEMPRE usar React Router v6
<Route path="/campaigns" element={<CampaignsPage />} />

// ❌ NUNCA usar:
Next.js router    // ❌
Reach Router      // ❌
Custom routing    // ❌
```

## 📁 Estrutura de Arquivos - OBRIGATÓRIA

```
src/
├── components/
│   ├── ui/              # APENAS componentes Shadcn/UI
│   ├── layouts/         # AuthLayout, AppLayout APENAS
│   └── features/        # Componentes de negócio
├── pages/              # Páginas/rotas
├── services/           # Lógica de API
├── stores/             # Stores Zustand
├── hooks/              # Custom hooks
├── lib/                # Utilitários (utils.ts, button-variants.ts)
└── styles/
    └── globals.css     # APENAS este arquivo CSS
```

### Arquivos Especiais em lib/
```typescript
// lib/utils.ts - Função cn() para merge de classes
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// lib/button-variants.ts - Variantes de botão extraídas
import { cva } from "class-variance-authority"

export const buttonVariants = cva(/* ... */)
```

## 🎨 Padrões de Código

### Nomenclatura
```typescript
// Componentes: PascalCase
export function UserProfile() {}

// Arquivos de componente: kebab-case
user-profile.tsx

// Hooks: camelCase com 'use' prefix
export function useUserData() {}

// Services: camelCase com 'Service' suffix
export const campaignsService = {}

// Stores: camelCase com 'Store' suffix
export const useAuthStore = {}
```

### Imports - Ordem Obrigatória
```typescript
// 1. React/Next
import React from 'react'
import { useState, useEffect } from 'react'

// 2. Bibliotecas externas
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

// 3. Componentes UI
import { Button } from '@/components/ui/button'

// 4. Componentes locais
import { Header } from '@/components/layouts/Header'

// 5. Services/Stores/Hooks
import { campaignsService } from '@/services/campaigns'

// 6. Types/Interfaces
import type { Campaign } from '@/types'
```

## ⚡ Performance - OBRIGATÓRIO

### 1. Lazy Loading de Rotas
```typescript
const CampaignsPage = lazy(() => import('@/pages/campaigns'))
```

### 2. React Query - Cache Obrigatório
```typescript
useQuery({
  queryKey: ['campaigns'],
  queryFn: fetchCampaigns,
  staleTime: 5 * 60 * 1000,    // 5 minutos
  cacheTime: 10 * 60 * 1000    // 10 minutos
})
```

### 3. Imagens - Sempre Otimizadas
```typescript
// ✅ SEMPRE usar loading lazy
<img src={url} alt={alt} loading="lazy" />

// ✅ SEMPRE especificar dimensões
<img src={url} alt={alt} width={400} height={300} />
```

## 🚫 PROIBIÇÕES ABSOLUTAS

### NUNCA FAZER:
1. ❌ Criar CSS files além de globals.css
2. ❌ Usar style={{}} inline
3. ❌ Hardcode cores (#fff, rgb(), blue-500)
4. ❌ Criar componentes que já existem em ui/
5. ❌ Fazer fetch sem React Query
6. ❌ Usar useEffect para API calls
7. ❌ Gerenciar form state manualmente
8. ❌ Criar layouts customizados
9. ❌ Usar console.log em produção
10. ❌ Commitar .env ou secrets

## ✅ SEMPRE FAZER

### OBRIGATÓRIOS:
1. ✅ Usar componentes de ui/ quando disponível
2. ✅ Tailwind para TODA estilização
3. ✅ Variáveis CSS para cores
4. ✅ React Query para TODAS as API calls
5. ✅ Zustand para estado global
6. ✅ React Hook Form + Zod para forms
7. ✅ Loading states em todas as queries
8. ✅ Error handling adequado
9. ✅ TypeScript strict mode
10. ✅ Acessibilidade (aria-labels, roles)

## 🧭 Padrão de Páginas (Listagem + CRUD)

Use “Campanhas” como referência visual e de UX para todas as páginas (Filiais, Estações, etc.).

1) Cabeçalho da Página
- Título em destaque à esquerda (ex.: “Campanhas”, “Filiais”, “Estações”).
- Subtítulo com descrição curta (uma linha) logo abaixo, quando fizer sentido.
- Botão primário de ação (ex.: “Nova Campanha”, “Nova Filial”, “Nova Estação”) à direita, `Button` padrão com ícone `Plus`.

2) Barra de Busca e Filtros
- Linha com:
  - Campo de busca com ícone `Search` à esquerda (placeholder “Buscar ...”).
  - Filtros específicos ao recurso ao lado (ex.: região/UF para Filiais; filial para Estações), usando `Select` com `SelectTrigger` e `SelectItem`.
- Nunca usar valores vazios em `SelectItem`; usar `value="all"` e mapear no estado.

3) Cards de Resumo (opcional)
- Quando houver métricas simples (contagens), mostrar 2–4 cards pequenos acima da tabela.
- Mesmo estilo do dashboard/cards: `CardHeader` compacto e valor em destaque no `CardContent`.

4) Tabela de Dados
- Tabela responsiva (`overflow-x-auto`).
- Coluna “Ações” alinhada à direita com botões de ícone:
  - Editar: `Button` `variant="outline"` `size="icon"` com `Pencil`.
  - Desativar/Excluir: `Button` `variant="destructive"` `size="icon"` com `Trash2` (com confirmação `confirm()` + toast).
- Estados:
  - Carregando: linha única “Carregando...”
  - Vazio: linha única “Nenhum registro encontrado”
  - Erro: usar `Alert` com mensagem amigável e ação “Tentar novamente”.

5) Paginação
- Padrão na base da tabela, alinhamento justificado:
  - Texto “Mostrando X–Y de Z”.
  - Botões “Anterior” e “Próxima” (`Button` `variant="outline"` `size="sm"`).
- Client-side é aceitável para protótipo; preferir paginação server-side (ver seção “API – Paginação”).

6) Skeletons & Toasters
- Skeletons nos blocos principais (cards/tabela) em carregamentos mais longos.
- `sonner` para toasts de sucesso/erro em ações (criar/editar/desativar/excluir).

7) Navegação e Acessos
- Ícones consistentes em navegação lateral.
- Usar `NavLink` para estado ativo.
- Proteger rotas com `AuthGuard` e `RoleGuard` conforme permissões.

8) Formulários (Create/Edit)
- Layout em `Card`, usando `Form`, `FormField`, `FormLabel`, `FormControl`, `FormMessage`.
- Botões “Salvar” (primário) e “Cancelar” (outline) alinhados à esquerda.
- Validar com Zod; mensagens curtas e claras.

## 🎛️ Preferências de Tema e Paleta

- Persistir tema (`light`/`dark`) em `localStorage` (`theme`).
- Persistir paleta primária (`blue|emerald|violet|rose|amber`) em `localStorage` (`theme_palette`).
- Inicializar na aplicação (ex.: `initThemeAndPalette()` no `App`).
- Oferecer troca rápida no menu do usuário e na página de Perfil.

## 🎯 Targeting (Campanhas)

- Seletor com modos: Global | Regiões | Filiais | Estações.
- Dados pelas rotas: `/api/branches/regions` e `/api/stations/available`.
- UX mínima:
  - Chips/contadores de seleção.
  - Ação “Limpar tudo”.
  - Resumo: Global | Regiões N | Filiais N | Estações N.
- Validação:
  - Global: arrays vazias.
  - Regiões: `regions.length >= 1` e `branches/stations` vazias.
  - Filiais: `branches.length >= 1`.
  - Estações: `stations.length >= 1` e coerência com filiais selecionadas.

## 🔌 API – Paginação (Recomendação)

Padronizar paginação server-side nos endpoints de listagem.

- Query params:
  - `page` (padrão: 1)
  - `limit` (padrão: 10, máx.: 100)
  - `search` (busca textual)
  - Filtros específicos (ex.: `region`, `state`, `is_active`, `branch_id`)
  - `sort` (ex.: `name`, `created_at`)
  - `order` (`asc|desc`)

- Resposta (exemplo):
```
{
  "items": [...],
  "page": 2,
  "page_size": 10,
  "total": 48,
  "total_pages": 5,
  "has_next": true,
  "has_prev": true
}
```

- Endpoints a considerar:
  - `GET /api/branches` + filtros (`region`, `state`, `is_active`, `search`)
  - `GET /api/stations` + filtros (`branch_id`/`branch_code`, `state`, `is_active`, `search`)

- Observações:
  - Manter coerência entre listagem e filtros das páginas de Campanhas/Filiais/Estações.
  - Evitar sobrecarregar respostas; incluir somente o necessário (ex.: em Estações, incluir um `branch` enxuto `{ code, name, state }`).

## 🧪 Checklist Antes de Commitar

```bash
# Executar SEMPRE antes de commitar:
□ npm run type-check    # Sem erros TypeScript
□ npm run lint          # Sem erros de lint
□ npm run build         # Build sem erros
□ Tema dark/light       # Testado em ambos
□ Responsividade        # Testado mobile/desktop
□ Sem console.log       # Removidos
□ Sem dados mockados    # Apenas API real

# OU usar o Makefile:
□ make check            # Executa type-check + lint
□ make build            # Verifica build
```

## 🔧 Comandos Úteis - Makefile

```bash
# Desenvolvimento
make dev                # Inicia servidor com hot reload
make dev-host          # Servidor acessível na rede local
make dev-port PORT=3000 # Servidor em porta customizada

# Qualidade
make lint              # Verifica código
make lint-fix          # Corrige problemas automaticamente
make type-check        # Verifica tipos TypeScript
make check             # Executa todas as verificações

# Build
make build             # Compila para produção
make preview           # Visualiza build localmente

# Componentes
make add-component COMP=dialog  # Adiciona componente Shadcn
make list-components            # Lista componentes disponíveis

# Utilidades
make clean             # Limpa cache e build
make install           # Instala dependências
make audit             # Verifica vulnerabilidades
```

## 📊 Métricas de Qualidade

### Targets Obrigatórios:
- **0 CSS customizado** (apenas Tailwind)
- **100% componentes reutilizados** (ui/)
- **Build < 200KB** (gzipped)
- **HMR < 100ms**
- **0 erros TypeScript**
- **0 warnings de lint**
- **Lighthouse Score > 90**

## 🔴 VIOLAÇÕES = REJEIÇÃO

Qualquer violação destas regras resultará em:
1. Código rejeitado no review
2. Refatoração obrigatória
3. Documentação da violação

## 📝 Exemplo de Código Padrão

```typescript
// ✅ EXEMPLO CORRETO - SEMPRE SEGUIR ESTE PADRÃO

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AppLayout } from '@/components/layouts/AppLayout'
import { campaignsService } from '@/services/campaigns'

export function CampaignsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignsService.getAll,
    staleTime: 5 * 60 * 1000
  })

  if (isLoading) return <CampaignsSkeleton />
  if (error) return <ErrorMessage error={error} />

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Campanhas</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.map(campaign => (
            <Card key={campaign.id}>
              <CardHeader>
                <CardTitle>{campaign.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {campaign.description}
                </p>
                <Button className="w-full mt-4">
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
```

---

**IMPORTANTE:** Este documento é a ÚNICA fonte de verdade. Qualquer dúvida, consulte estas regras. Não há exceções.

## 📋 Especificação Fiel – Página de Campanhas (Base para Padrão)

Esta seção normatiza exatamente o padrão visual e de UX usado em “Campanhas”. Todas as páginas de listagem (Filiais, Estações, etc.) devem replicar este padrão 100% fiel, mudando apenas colunas/filtros/ações específicas do recurso.

1) Container e espaçamento
- Wrapper externo: `div.container.mx-auto.p-6.space-y-6`
- Os blocos principais da página (Header, Toolbar, Cards, Table) devem respeitar `space-y-6`.

2) Cabeçalho (Header)
- Wrapper: `div.flex.items-center.justify-between`
- Título: `h1.text-3xl.font-bold` (ex.: “Campanhas”)
- Subtítulo: `p.text-muted-foreground` (ex.: “Gerencie suas campanhas de marketing digital”)
- Botão primário (direita): `<Button asChild><Link ...>>` com ícone à esquerda `className="mr-2 h-4 w-4"` e label curto (ex.: “Nova Campanha”).

3) Barra de Busca e Ações (Toolbar)
- Wrapper: `div.flex.gap-4`
- Busca: `div.relative.flex-1` contendo:
  - Ícone: `<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />`
  - Input: `<Input className="pl-9" placeholder="Buscar ..." />`
- Ações adicionais (opcional): `<Button variant="outline">` com ícone `Calendar` (ex.: “Filtros”).

4) Cards de Resumo (opcionais)
- Grid: `div.grid.grid-cols-1.md:grid-cols-4.gap-4`
- Cada Card:
  - `CardHeader` com `className="flex flex-row items-center justify-between space-y-0 pb-2"`
  - `CardTitle` com `className="text-sm font-medium"`
  - Ícone à direita: `<Icon className="h-4 w-4 text-muted-foreground" />` (ou `text-primary` para destaque)
  - `CardContent` com valor: `div.text-2xl.font-bold`

5) Tabela (Table)
- Wrapper: `Card` com `CardHeader` (título e `CardDescription`) e `CardContent`.
- `Table` padrão (`@/components/ui/table`), cabeçalho alinhado à esquerda.
- Coluna “Ações” na direita: wrapper `div.flex.items-center.justify-end.gap-2`.
- Botões de ação: `Button variant="ghost" size="icon"` com ícones `Image`, `Edit`, `Trash2` (`className="h-4 w-4"`).
- Status (Badge) – mapeamento de variantes:
  - `active` → `default`
  - `scheduled` → `secondary`
  - `paused` → `outline`
  - `expired` → `destructive`

6) Estados (Loading, Empty, Error)
- Loading: skeletons para header/toolbar/cards/tabela (ex.: blocks com `Skeleton`).
- Empty: `div.text-center.py-8 > p.text-muted-foreground` com mensagens claras:
  - Sem itens: “Nenhuma campanha encontrada. Crie sua primeira campanha!”
  - Sem resultado na busca: “Nenhuma campanha encontrada para o termo pesquisado.”
- Error: `Card` com `border-destructive`, `CardTitle.text-destructive` e botão “Tentar novamente”.

7) Diálogo de Exclusão (Delete)
- `Dialog` com `DialogHeader`, `DialogTitle`, `DialogDescription`.
- `DialogFooter` com botões:
  - Cancelar: `Button variant="outline"`
  - Excluir: `Button variant="destructive"` (desabilitar enquanto pending)

8) Tipografia e Cores
- Título principal: `text-3xl font-bold`.
- Títulos dos cards: `text-sm font-medium`.
- Tabela: `text-sm`.
- Auxiliar: `text-muted-foreground` para descrições/subtítulos.
- Seguir variáveis de tema para cores (bg, border, primary, ring).

9) Ícones e Botões
- Ícones `lucide-react`, tamanho `h-4 w-4`.
- Ícone no botão primário com `mr-2`.
- Ações na tabela: `variant="ghost" size="icon"`.

10) Acessibilidade e Responsividade
- Grid responsivo nos cards (1 → 4 no md).
- Inputs com placeholder descritivo; ícones com uso semântico.

Aplicação do padrão
- Filiais e Estações devem usar exatamente este padrão (estrutura, tamanhos, variantes e ícones), alterando somente colunas, filtros e ações específicas de cada recurso.
