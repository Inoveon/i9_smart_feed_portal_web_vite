# ⚠️ INSTRUÇÕES OBRIGATÓRIAS PARA DESENVOLVIMENTO - CLAUDE/IA

## 🔴 ATENÇÃO: LEIA ANTES DE QUALQUER CÓDIGO

Este projeto usa **Vite + React + TypeScript + Tailwind CSS + Shadcn/UI** com padrões RÍGIDOS que DEVEM ser seguidos. Qualquer violação resultará em código rejeitado.

## 📋 ANTES DE COMEÇAR - CHECKLIST OBRIGATÓRIO

### 1. Verifique se existe o componente
```bash
# SEMPRE verificar se o componente já existe em:
ls src/components/ui/

# Se existir, USE-O. NUNCA crie outro.
```

### 2. Verifique os padrões
```bash
# SEMPRE leia antes de codificar:
cat docs/agents/shared/REACT-VITE-STANDARDS.md
```

### 3. Verifique a estrutura
```
src/
├── components/ui/      # APENAS componentes Shadcn - NÃO ADICIONE NADA AQUI
├── components/layouts/ # APENAS AppLayout e AuthLayout
├── components/features/# Seus componentes de negócio vão AQUI
├── pages/             # Páginas da aplicação
├── services/          # Chamadas de API
├── stores/            # Estados Zustand
├── hooks/             # Custom hooks
└── lib/               # Utilitários
```

## 🔌 INTEGRAÇÃO COM API - REGRA FUNDAMENTAL

### ⚠️ NUNCA USE DADOS MOCKADOS
```typescript
// ❌ PROIBIDO - Será rejeitado imediatamente:
const feeds = [{ id: 1, name: "Teste" }]  // ❌ NUNCA
const mockData = generateFakeData()           // ❌ NUNCA
return Promise.resolve(fakeResponse)          // ❌ NUNCA

// ✅ OBRIGATÓRIO - Sempre use API real:
const { data } = useQuery({
  queryKey: ['feeds'],
  queryFn: feedsService.getAll  // Chamada real à API
})
```

### 📋 FLUXO OBRIGATÓRIO ANTES DE CODIFICAR:
1. **Ler documentação da API** (`docs/api/` ou `docs/API-INTEGRATION-RULES.md`)
2. **Testar endpoints com curl/Postman** 
3. **Validar estrutura de resposta**
4. **Criar types baseados na resposta real**
5. **Implementar service com chamadas reais**
6. **Usar React Query para gerenciar estado**
7. **Desenvolver UI com dados reais**

**VER DETALHES COMPLETOS:** `docs/API-INTEGRATION-RULES.md`

## 🚫 PROIBIÇÕES ABSOLUTAS - NUNCA FAÇA ISSO

### 1. CSS/Estilização
```typescript
// ❌ NUNCA FAÇA:
style={{ color: 'blue' }}              // ❌ Inline styles
import './styles.css'                   // ❌ CSS files
styled.div``                           // ❌ Styled components
className="bg-blue-500"                // ❌ Cores hardcoded
<style jsx>{``}</style>                // ❌ CSS-in-JS

// ✅ SEMPRE FAÇA:
className="bg-primary text-foreground"  // ✅ Variáveis de tema
className="flex items-center gap-4"     // ✅ Tailwind apenas
```

### 2. Componentes
```typescript
// ❌ NUNCA FAÇA:
<button>Click</button>                  // ❌ HTML direto
<div className="card">                  // ❌ Criar componentes

// ✅ SEMPRE FAÇA:
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
<Button>Click</Button>                  // ✅ Usar componentes UI
```

### 3. API Calls
```typescript
// ❌ NUNCA FAÇA:
useEffect(() => {
  fetch('/api/data')                    // ❌ Fetch direto
}, [])

const data = await axios.get()          // ❌ Axios direto

// ✅ SEMPRE FAÇA:
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: dataService.getAll          // ✅ React Query sempre
})
```

### 4. Estado
```typescript
// ❌ NUNCA FAÇA:
const [formData, setFormData] = useState({})  // ❌ Estado manual para forms
<Context.Provider>                            // ❌ Context API
useReducer()                                  // ❌ useReducer

// ✅ SEMPRE FAÇA:
const form = useForm({ resolver: zodResolver(schema) })  // ✅ React Hook Form
const user = useAuthStore(state => state.user)          // ✅ Zustand
```

## ✅ PADRÕES OBRIGATÓRIOS

### 1. Estrutura de Página
```typescript
// SEMPRE siga este padrão EXATO:
import { AppLayout } from '@/components/layouts/AppLayout'

export function PageName() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['key'],
    queryFn: service.method
  })
  
  if (isLoading) return <PageSkeleton />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Título</h1>
        {/* conteúdo */}
      </div>
    </AppLayout>
  )
}
```

### 2. Formulários
```typescript
// SEMPRE use React Hook Form + Zod:
const schema = z.object({
  field: z.string().min(3)
})

const form = useForm({
  resolver: zodResolver(schema)
})

// SEMPRE use componentes Form do Shadcn:
<Form {...form}>
  <FormField
    control={form.control}
    name="field"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### 3. Cores e Tema
```typescript
// SEMPRE use variáveis CSS:
className="bg-background"         // Fundo principal
className="bg-card"               // Fundo de cards
className="text-foreground"       // Texto principal
className="text-muted-foreground" // Texto secundário
className="border-border"         // Bordas
className="bg-primary"           // Cor primária
className="bg-destructive"       // Cor de erro/delete

// NUNCA use:
// bg-white, bg-black, bg-gray-100, #ffffff, rgb()
```

## 📁 ONDE COLOCAR CADA COISA

```typescript
// Componente de UI? → NÃO CRIE! Use de ui/
import { Button } from '@/components/ui/button'

// Layout? → components/layouts/
// APENAS: AppLayout.tsx, AuthLayout.tsx

// Componente de negócio? → components/features/
// Ex: FeedCard.tsx, MetricsChart.tsx

// Página? → pages/
// Ex: pages/feeds/index.tsx

// Chamada de API? → services/
// Ex: services/feeds.service.ts

// Estado global? → stores/
// Ex: stores/auth.store.ts

// Hook customizado? → hooks/
// Ex: hooks/useFeeds.ts

// Utilitário? → lib/
// Ex: lib/utils.ts, lib/constants.ts
```

## 🎯 FLUXO DE DESENVOLVIMENTO

### 1. Precisa de um componente?
```
Existe em ui/? 
  ↓ SIM → Use ele
  ↓ NÃO → É um componente de layout?
           ↓ SIM → PARE! Use AppLayout ou AuthLayout
           ↓ NÃO → Crie em components/features/
```

### 2. Precisa buscar dados?
```
Crie um service → services/nome.service.ts
Use React Query → useQuery/useMutation
NUNCA use fetch/axios direto
```

### 3. Precisa de estado?
```
É de formulário? → React Hook Form
É global? → Zustand store
É local? → useState (apenas para UI simples)
```

## 🔍 VERIFICAÇÕES ANTES DE COMMITAR

```bash
# Execute TODOS antes de qualquer commit:
npm run type-check  # 0 erros
npm run lint        # 0 warnings
npm run build       # Build sucesso

# Verifique manualmente:
- [ ] Sem style={{}}
- [ ] Sem cores hardcoded
- [ ] Sem CSS files novos
- [ ] Sem console.log
- [ ] Sem dados mockados
- [ ] Tema dark/light funcionando
- [ ] Responsivo (mobile/desktop)
```

## 🚨 COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run dev

# Adicionar componente Shadcn
npx shadcn-ui@latest add [component]

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## 📝 EXEMPLO DE CÓDIGO CORRETO

```typescript
// ✅ ESTE É O PADRÃO - SEMPRE SIGA:

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Componentes UI (Shadcn)
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// Layout
import { AppLayout } from '@/components/layouts/AppLayout'

// Services
import { feedsService } from '@/services/feeds.service'

// Schema de validação
const feedSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().optional()
})

export function FeedPage() {
  // React Query para dados
  const { data, isLoading } = useQuery({
    queryKey: ['feeds'],
    queryFn: feedsService.getAll
  })
  
  // React Hook Form para formulário
  const form = useForm({
    resolver: zodResolver(feedSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  })
  
  // Submit handler
  const onSubmit = async (values: z.infer<typeof feedSchema>) => {
    try {
      await feedsService.create(values)
      toast.success('Feed criado!')
    } catch (error) {
      toast.error('Erro ao criar feed')
    }
  }
  
  // Loading state
  if (isLoading) {
    return <FeedSkeleton />
  }
  
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Feeds</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de feeds */}
          <div className="lg:col-span-2">
            {data?.map(feed => (
              <Card key={feed.id} className="mb-4">
                <CardHeader>
                  <CardTitle>{feed.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {feed.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Novo Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do feed" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Criar Feed
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
```

## ⚡ DICAS FINAIS

1. **Em dúvida?** Verifique docs/agents/shared/REACT-VITE-STANDARDS.md
2. **Componente existe?** Use de ui/
3. **Cor?** Use variável de tema
4. **API?** Use React Query
5. **Form?** Use React Hook Form
6. **Estado?** Use Zustand
7. **CSS?** Use Tailwind APENAS

---

**LEMBRE-SE:** Este documento é LEI. Siga-o EXATAMENTE ou seu código será rejeitado.