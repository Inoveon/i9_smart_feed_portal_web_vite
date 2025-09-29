# QA-REVIEW - Agente de Revisão Contínua de Qualidade

## 📋 Objetivo
Validar continuamente a qualidade do código, aderência aos padrões, performance e acessibilidade do portal i9 Smart Campaigns.

## 🎯 Execução
Este agente deve ser executado:
- Após cada implementação de funcionalidade
- Antes de cada commit
- Durante revisões de código
- Periodicamente para manutenção preventiva

## ✅ Checklist de Validação

### 1. PADRÕES DE CÓDIGO (docs/agents/shared/REACT-VITE-STANDARDS.md)

#### Componentes UI
- [ ] Todos os componentes UI vêm de `@/components/ui/`
- [ ] Nenhum componente duplicado foi criado
- [ ] Nenhum HTML direto quando existe componente UI
- [ ] Componentes de layout usando apenas AppLayout/AuthLayout

#### Estilização
- [ ] APENAS classes Tailwind são usadas
- [ ] ZERO `style={{}}` inline no código
- [ ] ZERO arquivos CSS além de `globals.css`
- [ ] ZERO styled-components ou CSS-in-JS
- [ ] Todas as cores usando variáveis de tema (bg-primary, text-foreground)
- [ ] ZERO cores hardcoded (#fff, rgb(), blue-500)

#### API e Estado
- [ ] Todas as chamadas API usando React Query
- [ ] ZERO fetch ou axios direto em componentes
- [ ] Estado global usando Zustand
- [ ] Formulários usando React Hook Form + Zod
- [ ] ZERO useState para gerenciar formulários

#### Estrutura de Arquivos
- [ ] Arquivos na estrutura correta conforme REACT-VITE-STANDARDS.md
- [ ] Nomenclatura seguindo padrões (PascalCase, kebab-case)
- [ ] Imports na ordem correta

### 2. FUNCIONALIDADE

#### Autenticação
- [ ] Login funcionando com API real
- [ ] JWT token sendo enviado nas requisições
- [ ] Refresh token automático funcionando
- [ ] Logout limpando todos os estados
- [ ] Rotas protegidas redirecionando para login

#### Dashboard
- [ ] Métricas carregando da API
- [ ] Gráficos renderizando corretamente
- [ ] Campanhas recentes listadas
- [ ] Imagens recentes exibidas
- [ ] Auto-refresh funcionando (30s)

#### CRUD Campanhas
- [ ] Listagem com paginação
- [ ] Criação com validação
- [ ] Edição preservando dados
- [ ] Exclusão com confirmação
- [ ] Upload de imagens funcionando

#### Tema
- [ ] Toggle dark/light funcionando
- [ ] Tema persistindo após reload
- [ ] Todas as páginas respeitando tema
- [ ] Contraste adequado em ambos os temas

### 3. PERFORMANCE

#### Build
- [ ] `npm run build` sem erros
- [ ] Bundle size < 200KB (gzipped)
- [ ] Zero warnings no console

#### TypeScript
- [ ] `npm run type-check` com 0 erros
- [ ] Strict mode habilitado
- [ ] Tipos definidos para todas as props

#### Desenvolvimento
- [ ] HMR < 100ms
- [ ] Zero re-renders desnecessários
- [ ] React Query cache configurado

### 4. QUALIDADE

#### Código Limpo
- [ ] Zero `console.log` em produção
- [ ] Zero comentários desnecessários
- [ ] Zero código comentado
- [ ] Zero TODOs pendentes
- [ ] Zero dados mockados

#### Segurança
- [ ] Nenhum secret no código
- [ ] .env não commitado
- [ ] Tokens não logados
- [ ] Inputs sanitizados

#### Acessibilidade
- [ ] aria-labels em botões de ícone
- [ ] Formulários com labels adequados
- [ ] Navegação por teclado funcionando
- [ ] Contraste WCAG AA

### 5. RESPONSIVIDADE

#### Mobile (375px - 768px)
- [ ] Layout não quebrado
- [ ] Menu mobile funcionando
- [ ] Formulários usáveis
- [ ] Tabelas com scroll horizontal

#### Tablet (768px - 1024px)
- [ ] Grid layouts ajustados
- [ ] Sidebar comportamento correto

#### Desktop (1024px+)
- [ ] Layout otimizado
- [ ] Uso eficiente do espaço

### 6. UX/UI

#### Feedback Visual
- [ ] Loading states em todas as operações
- [ ] Error states com mensagens claras
- [ ] Success toasts para ações
- [ ] Empty states informativos

#### Navegação
- [ ] Breadcrumbs onde aplicável
- [ ] Back buttons funcionando
- [ ] Links destacados visualmente
- [ ] Active state no menu

### 7. TESTES MANUAIS

#### Fluxos Críticos
- [ ] Login → Dashboard → Logout
- [ ] Criar nova campanha com imagens
- [ ] Editar campanha existente
- [ ] Deletar campanha
- [ ] Upload de múltiplas imagens
- [ ] Filtrar e ordenar listagens

#### Edge Cases
- [ ] Sessão expirada → redirect login
- [ ] API offline → error handling
- [ ] Upload arquivo inválido → erro claro
- [ ] Formulário com dados inválidos → validação

## 🔴 VIOLAÇÕES CRÍTICAS

Se qualquer item abaixo for encontrado, **PARE IMEDIATAMENTE**:

1. ❌ CSS customizado além de globals.css
2. ❌ style={{}} inline
3. ❌ Cores hardcoded
4. ❌ Componente duplicado de UI
5. ❌ fetch/axios direto sem React Query
6. ❌ console.log em produção
7. ❌ Dados mockados/fake
8. ❌ Secrets no código

## 📊 Métricas de Qualidade

### Score Mínimo Aceitável:
```
TypeScript Errors:    0
ESLint Warnings:      0
Build Warnings:       0
Console Errors:       0
Failed Tests:         0
Lighthouse Score:     > 90
Bundle Size:          < 200KB
```

### Comandos de Validação:
```bash
# Executar todos os checks
npm run type-check    # Deve passar sem erros
npm run lint          # Deve passar sem warnings
npm run build         # Deve buildar sem erros
npm run test          # Todos os testes passando
```

## 🎯 Ações Corretivas

### Se encontrar violações:

1. **Padrões de Código**
   - Refatore imediatamente seguindo docs/agents/shared/REACT-VITE-STANDARDS.md
   - Substitua componentes customizados por Shadcn/UI
   - Remova todo CSS customizado

2. **Performance**
   - Otimize imports (lazy loading)
   - Implemente React.memo onde necessário
   - Configure cache do React Query

3. **Acessibilidade**
   - Adicione aria-labels faltantes
   - Corrija contrastes inadequados
   - Implemente navegação por teclado

4. **Segurança**
   - Remova logs de dados sensíveis
   - Mova secrets para variáveis de ambiente
   - Implemente sanitização de inputs

## 📝 Relatório de QA

Após cada revisão, documente:

```markdown
## QA Review - [DATA]

### ✅ Aprovados
- Item 1
- Item 2

### ⚠️ Warnings (não críticos)
- Warning 1
- Warning 2

### ❌ Falhas Críticas
- Falha 1
- Falha 2

### 📊 Métricas
- TypeScript Errors: 0
- Bundle Size: XXXkb
- Lighthouse: XX/100

### 🔧 Ações Tomadas
- Correção 1
- Correção 2

### 📅 Próxima Revisão
- Data: XX/XX/XXXX
```

## 🤖 Automação

### GitHub Actions (sugestão):
```yaml
name: QA Review
on: [push, pull_request]
jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## 🎓 Aprendizado Contínuo

### Após cada revisão:
1. Documente padrões violados frequentemente
2. Atualize docs/agents/shared/REACT-VITE-STANDARDS.md se necessário
3. Compartilhe aprendizados com a equipe
4. Crie snippets para padrões comuns

## 📚 Documentação de Referência

- **Padrões de Código**: `docs/agents/shared/REACT-VITE-STANDARDS.md`
- **Instruções para IA**: `CLAUDE.md` na raiz
- **Plano de Migração**: `MIGRATION-PLAN.md`
- **API Documentation**: `docs/API-DOCUMENTATION.md`

---

**LEMBRE-SE:** Qualidade não é negociável. Cada violação encontrada e corrigida melhora o produto final.