# A11 - Sistema de Help Contextual

## ⚠️ REGRAS FUNDAMENTAIS - LEIA PRIMEIRO

### NUNCA FAZER:
- ❌ Usar emojis nos arquivos de help
- ❌ Criar conteúdo genérico ou placeholder
- ❌ Adicionar CSS inline ou styled components
- ❌ Modificar componentes fora do escopo
- ❌ Criar novos componentes UI básicos

### SEMPRE FAZER:
- ✅ Seguir `docs/agents/shared/REACT-VITE-STANDARDS.md`
- ✅ Usar componentes Shadcn/UI existentes
- ✅ Manter estilo profissional e técnico
- ✅ Criar conteúdo específico para cada página
- ✅ Testar navegação e carregamento dinâmico

## 📋 Objetivo
Implementar sistema de help contextual com documentação em Markdown para todas as páginas do portal, acessível através de ícone na barra superior.

## 📚 Referências Obrigatórias
- **Padrões de Código**: `docs/agents/shared/REACT-VITE-STANDARDS.md`
- **Layout Principal**: `src/components/layouts/AppLayout.tsx`
- **Componentes UI**: `src/components/ui/`

## 🔍 Dependências
- A01-SETUP-BASE ✅
- A02-LAYOUTS-COMPONENTS ✅
- A03-AUTH-SYSTEM ✅

## 🎯 Tarefas

### 1. Criar Estrutura de Arquivos de Help

#### 1.1 Criar diretório para arquivos de help
```bash
mkdir -p public/help
```

#### 1.2 Criar mapeamento de rotas para arquivos
```typescript
// src/lib/help-mapping.ts
export const helpMapping: Record<string, string> = {
  '/': 'dashboard.md',
  '/dashboard': 'dashboard.md',
  '/campaigns': 'campaigns.md',
  '/campaigns/new': 'campaigns-new.md',
  '/campaigns/:id/edit': 'campaigns-edit.md',
  '/campaigns/:id/images': 'campaigns-images.md',
  '/branches': 'branches.md',
  '/stations': 'stations.md',
  '/activities': 'activities.md',
  '/analytics': 'analytics.md',
  '/settings': 'settings.md',
  '/profile': 'profile.md',
}

export function getHelpFile(pathname: string): string {
  // Tentar match exato primeiro
  if (helpMapping[pathname]) {
    return helpMapping[pathname]
  }
  
  // Tentar match com parâmetros
  for (const [pattern, file] of Object.entries(helpMapping)) {
    if (pattern.includes(':')) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$')
      if (regex.test(pathname)) {
        return file
      }
    }
  }
  
  return 'default.md'
}
```

### 2. Criar Componente de Help

#### 2.1 Instalar dependência para renderizar Markdown
```bash
npm install react-markdown remark-gfm
```

#### 2.2 Criar componente HelpDrawer
```typescript
// src/components/features/HelpDrawer.tsx
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { HelpCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getHelpFile } from '@/lib/help-mapping'

export function HelpDrawer() {
  const location = useLocation()
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const loadHelp = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const helpFile = getHelpFile(location.pathname)
        const response = await fetch(`/help/${helpFile}`)
        
        if (!response.ok) {
          // Tentar carregar help padrão se arquivo específico não existir
          const defaultResponse = await fetch('/help/default.md')
          if (defaultResponse.ok) {
            const text = await defaultResponse.text()
            setContent(text)
          } else {
            setError('Arquivo de ajuda não encontrado')
          }
        } else {
          const text = await response.text()
          setContent(text)
        }
      } catch (err) {
        setError('Erro ao carregar ajuda')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadHelp()
  }, [location.pathname])
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Ajuda">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Ajuda</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          {isLoading && (
            <div className="text-muted-foreground">Carregando...</div>
          )}
          
          {error && (
            <div className="text-destructive">{error}</div>
          )}
          
          {!isLoading && !error && content && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
```

### 3. Integrar Help no AppLayout

#### 3.1 Modificar AppLayout para incluir HelpDrawer
```typescript
// src/components/layouts/AppLayout.tsx
// Adicionar import
import { HelpDrawer } from '@/components/features/HelpDrawer'

// No header, após o UserButton:
<div className="flex items-center gap-2">
  <HelpDrawer />
  <UserButton />
</div>
```

### 4. Criar Arquivos de Help

#### 4.1 Arquivo padrão
```markdown
// public/help/default.md
# Ajuda do Sistema

## Visão Geral
Bem-vindo ao sistema i9 Smart Feed Portal. Este é o portal de gerenciamento de campanhas digitais para tablets.

## Navegação
Use o menu lateral para acessar as diferentes seções do sistema.

## Suporte
Para suporte técnico, entre em contato com a equipe de TI.
```

#### 4.2 Help do Dashboard
```markdown
// public/help/dashboard.md
# Dashboard

## Visão Geral
O Dashboard apresenta métricas e informações consolidadas sobre as campanhas ativas e o desempenho do sistema.

## Métricas Principais

### Campanhas Ativas
Número total de campanhas que estão sendo exibidas nos tablets atualmente.

### Estações Ativas
Quantidade de estações (tablets) que estão online e exibindo conteúdo.

### Visualizações Hoje
Total de visualizações de campanhas registradas no dia atual.

### Taxa de Engajamento
Percentual de interação dos usuários com as campanhas exibidas.

## Gráficos

### Visualizações por Hora
Mostra a distribuição de visualizações ao longo do dia, permitindo identificar horários de pico.

### Campanhas por Filial
Apresenta a distribuição de campanhas ativas por filial, facilitando o acompanhamento regional.

## Tabelas

### Campanhas Recentes
Lista as últimas campanhas criadas ou modificadas, com acesso rápido para edição.

### Atividades Recentes
Registro das últimas ações realizadas no sistema por todos os usuários.

## Dicas de Uso

- Os dados são atualizados automaticamente a cada 30 segundos
- Clique nos gráficos para visualizar detalhes
- Use os filtros de data para análise histórica
```

#### 4.3 Help de Campanhas
```markdown
// public/help/campaigns.md
# Campanhas

## Visão Geral
Gerencie campanhas de marketing digital que serão exibidas nos tablets das estações.

## Funcionalidades

### Listar Campanhas
A tabela principal exibe todas as campanhas cadastradas com informações essenciais.

### Filtros e Busca
- **Busca por nome**: Digite o nome da campanha para filtrar
- **Status**: Filtre por Ativas, Agendadas, Pausadas ou Expiradas
- **Região**: Selecione uma região específica

### Criar Nova Campanha
1. Clique em "Nova Campanha"
2. Preencha os dados obrigatórios:
   - Nome da campanha
   - Descrição (opcional)
   - Data de início e fim
   - Tempo de exibição
3. Selecione as estações onde será exibida
4. Defina a prioridade (0-100)
5. Salve a campanha

### Editar Campanha
- Clique no ícone de lápis para editar
- Modifique os campos necessários
- Salve as alterações

### Gerenciar Imagens
- Clique no ícone de imagem
- Faça upload de novas imagens
- Organize a ordem de exibição
- Remova imagens desnecessárias

### Excluir Campanha
- Clique no ícone de lixeira
- Confirme a exclusão
- Campanhas excluídas não podem ser recuperadas

## Status das Campanhas

- **Ativa**: Em exibição nos tablets
- **Agendada**: Aguardando data de início
- **Pausada**: Temporariamente suspensa
- **Expirada**: Passou da data final

## Segmentação

### Global
Campanhas sem segmentação específica são exibidas em todas as estações.

### Por Região
Selecione regiões específicas para exibição regional.

### Por Filial
Escolha filiais individuais para campanhas localizadas.

### Por Estação
Defina estações específicas para máximo controle.

## Boas Práticas

- Mantenha nomes descritivos e únicos
- Use imagens de alta qualidade (mínimo 1920x1080)
- Defina prioridades adequadas para campanhas importantes
- Monitore o desempenho através do Analytics
```

#### 4.4 Help de Upload de Imagens
```markdown
// public/help/campaigns-images.md
# Gerenciamento de Imagens

## Visão Geral
Faça upload e organize as imagens que serão exibidas na campanha.

## Upload de Imagens

### Formatos Aceitos
- JPG/JPEG
- PNG
- WEBP

### Especificações
- Tamanho máximo: 10MB por arquivo
- Resolução recomendada: 1920x1080 pixels
- Proporção ideal: 16:9 (horizontal)

### Como Fazer Upload
1. Clique ou arraste arquivos para a área de upload
2. Selecione múltiplos arquivos de uma vez (máximo 10)
3. Aguarde o processamento
4. As imagens serão adicionadas automaticamente à galeria

## Organização

### Reordenar Imagens
- Arraste e solte para reorganizar
- A ordem define a sequência de exibição
- As mudanças são salvas automaticamente

### Tempo de Exibição
- Cada imagem usa o tempo padrão da campanha
- Personalize individualmente se necessário

### Excluir Imagens
- Passe o mouse sobre a imagem
- Clique no ícone de lixeira
- Confirme a exclusão

## Galeria

### Visualização
- Clique no ícone de olho para ampliar
- Veja detalhes como dimensões e tamanho

### Informações da Imagem
- Nome do arquivo
- Ordem de exibição
- Tempo de exibição
- Status (ativa/inativa)

## Limitações

- Máximo 20 imagens por campanha
- Upload de até 10 arquivos por vez
- Processamento pode levar alguns segundos

## Dicas de Otimização

### Qualidade vs Tamanho
- Use JPEG para fotos (melhor compressão)
- Use PNG para imagens com transparência
- Comprima imagens antes do upload

### Performance
- Evite imagens muito pesadas (> 5MB)
- Mantenha resolução adequada ao display
- Use formatos modernos como WEBP quando possível

## Solução de Problemas

### Upload Falhou
- Verifique o formato do arquivo
- Confirme que não excede 10MB
- Tente um arquivo por vez

### Imagem Não Aparece
- Aguarde o processamento completo
- Recarregue a página
- Verifique se a imagem está ativa

### Ordem Não Salva
- Aguarde a confirmação visual
- Evite mudanças muito rápidas
- Recarregue se necessário
```

#### 4.5 Outros arquivos de help (criar conforme necessário)
- branches.md
- stations.md
- activities.md
- analytics.md
- settings.md
- profile.md

### 5. Adicionar Estilos para Markdown

#### 5.1 Configurar estilos do prose (Tailwind Typography)
```bash
npm install @tailwindcss/typography
```

#### 5.2 Adicionar ao tailwind.config.js
```javascript
// tailwind.config.js
plugins: [
  require("tailwindcss-animate"),
  require("@tailwindcss/typography"),
]
```

### 6. Testes e Validação

#### 6.1 Testar carregamento dinâmico
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Navegar pelas páginas e verificar se help carrega corretamente
```

#### 6.2 Verificar responsividade
- Testar em diferentes tamanhos de tela
- Confirmar que drawer não quebra layout
- Validar scroll em conteúdo longo

## ✅ Checklist de Validação

- [ ] Diretório public/help criado
- [ ] Arquivo help-mapping.ts implementado
- [ ] Componente HelpDrawer criado e funcional
- [ ] HelpDrawer integrado ao AppLayout
- [ ] React-markdown instalado e configurado
- [ ] Tailwind Typography configurado
- [ ] Arquivo default.md criado
- [ ] Help do dashboard criado
- [ ] Help de campanhas criado
- [ ] Help de imagens criado
- [ ] Pelo menos 5 arquivos de help criados
- [ ] Navegação entre páginas mantém help contextual
- [ ] Drawer abre e fecha corretamente
- [ ] Conteúdo markdown renderiza com formatação
- [ ] Scroll funciona em conteúdo longo
- [ ] Sem emojis nos arquivos de help
- [ ] Estilo profissional e técnico mantido
- [ ] Sem erros no console
- [ ] Build passa sem warnings
- [ ] Responsivo em mobile e desktop

## 📊 Resultado Esperado

Sistema de help contextual totalmente funcional com:
- Ícone de help visível em todas as páginas
- Conteúdo específico para cada rota
- Renderização adequada de Markdown
- Interface limpa e profissional
- Carregamento dinâmico eficiente
- Fallback para conteúdo padrão

## 🔧 Troubleshooting

### Help não carrega
1. Verificar se arquivo existe em public/help/
2. Confirmar nome no mapeamento
3. Verificar console para erros de fetch

### Markdown não renderiza
1. Confirmar instalação do react-markdown
2. Verificar imports corretos
3. Validar sintaxe markdown

### Drawer não abre
1. Verificar componente Sheet do Shadcn
2. Confirmar trigger está visível
3. Checar z-index conflicts

## 📝 Notas de Implementação

- Usar Sheet ao invés de Dialog para melhor UX
- Manter arquivos markdown simples e diretos
- Evitar imagens nos helps (ou usar URLs absolutas)
- Considerar cache para arquivos já carregados
- Possível melhoria futura: busca dentro do help