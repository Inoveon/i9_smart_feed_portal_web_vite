# 📚 Documentação - i9 Smart Campaigns Portal

Documentação completa do portal de campanhas publicitárias i9 Smart.

## 📂 Estrutura da Documentação

```
docs/
├── agents/                    # Sistema de agentes de desenvolvimento
│   ├── pending/              # Agentes aguardando execução
│   ├── completed/            # Agentes executados
│   ├── continuous/           # Agentes de execução contínua
│   └── shared/               # Recursos compartilhados
├── api/                      # Documentação da API (futuro)
├── guides/                   # Guias e tutoriais (futuro)
└── API-DOCUMENTATION.md     # Especificação completa da API
```

## 📖 Documentos Principais

### 1. API Documentation
**Arquivo:** `API-DOCUMENTATION.md`

Especificação completa da API RESTful do backend FastAPI, incluindo:
- 🔐 Endpoints de autenticação (JWT)
- 📊 Endpoints do dashboard
- 🎯 CRUD de campanhas
- 🖼️ Gerenciamento de imagens
- 📍 Gestão de estações
- 📈 Analytics e métricas

### 2. Sistema de Agentes
**Diretório:** `agents/`

Sistema automatizado para desenvolvimento incremental:
- **10 agentes** de desenvolvimento sequencial
- **QA-REVIEW** para validação contínua
- **Padrões rígidos** em `shared/REACT-VITE-STANDARDS.md`

[📖 Ver documentação completa dos agentes](agents/README.md)

### 3. Padrões de Código
**Arquivo:** `agents/shared/REACT-VITE-STANDARDS.md`

Regras obrigatórias para todo desenvolvimento:
- ✅ Componentes Shadcn/UI
- ✅ Tailwind CSS apenas
- ✅ React Query para API
- ✅ Zustand para estado
- ❌ Sem CSS customizado
- ❌ Sem cores hardcoded

## 🎯 Quick Links

### Para Desenvolvedores
- [Padrões de Código](agents/shared/REACT-VITE-STANDARDS.md)
- [Agentes de Desenvolvimento](agents/)
- [API Documentation](API-DOCUMENTATION.md)
- [Instruções para IA](../CLAUDE.md)

### Para DevOps
- [Deploy com Docker](agents/pending/A10-SETTINGS-DEPLOY.md)
- [CI/CD Pipeline](agents/pending/A10-SETTINGS-DEPLOY.md#github-actions-cicd)
- [Configurações de Produção](agents/pending/A10-SETTINGS-DEPLOY.md#variáveis-de-ambiente)

### Para QA
- [QA Review Process](agents/continuous/QA-REVIEW.md)
- [Checklist de Validação](agents/continuous/QA-REVIEW.md#checklist-de-validação)
- [Métricas de Qualidade](agents/continuous/QA-REVIEW.md#métricas-de-qualidade)

## 🚀 Getting Started

### 1. Novo no Projeto?
```bash
# Leia primeiro
cat docs/agents/shared/REACT-VITE-STANDARDS.md

# Entenda a estrutura
cat docs/agents/README.md

# Veja a API
cat docs/API-DOCUMENTATION.md
```

### 2. Começando Desenvolvimento
```bash
# Execute o primeiro agente
cat docs/agents/pending/A01-SETUP-BASE.md

# Siga as instruções passo a passo
npm create vite@latest . -- --template react-ts
# ... continue com o agente
```

### 3. Validando Código
```bash
# Execute QA Review
cat docs/agents/continuous/QA-REVIEW.md

# Rode os checks
npm run type-check
npm run lint
npm run build
```

## 📊 Cobertura da Documentação

| Área | Status | Arquivo/Diretório |
|------|--------|-------------------|
| API Backend | ✅ Completo | `API-DOCUMENTATION.md` |
| Agentes Dev | ✅ Completo | `agents/` |
| Padrões | ✅ Completo | `agents/shared/REACT-VITE-STANDARDS.md` |
| QA Process | ✅ Completo | `agents/continuous/QA-REVIEW.md` |
| Deploy | ✅ Completo | `agents/pending/A10-SETTINGS-DEPLOY.md` |
| User Guides | 🚧 Futuro | `guides/` |
| API Client | 🚧 Futuro | `api/` |

## 🔄 Processo de Atualização

### Como Atualizar Documentação

1. **Identifique** a seção apropriada
2. **Mantenha** o formato existente
3. **Valide** links e referências
4. **Atualize** data de modificação
5. **Documente** mudanças significativas

### Versionamento

- **Major:** Mudanças estruturais na API
- **Minor:** Novos agentes ou funcionalidades
- **Patch:** Correções e clarificações

## 🎓 Recursos de Aprendizado

### Essenciais
1. [React Documentation](https://react.dev)
2. [Vite Documentation](https://vitejs.dev)
3. [Shadcn/UI Components](https://ui.shadcn.com)
4. [Tailwind CSS](https://tailwindcss.com)

### Stack Específica
1. [React Query](https://tanstack.com/query)
2. [Zustand](https://zustand-demo.pmnd.rs)
3. [React Hook Form](https://react-hook-form.com)
4. [Zod](https://zod.dev)

## 🐛 Reportando Issues

Encontrou erro na documentação?

1. Verifique se já não foi reportado
2. Abra issue com template apropriado
3. Inclua:
   - Arquivo/seção afetada
   - Descrição do problema
   - Sugestão de correção

## 📈 Métricas de Documentação

- **10** Agentes de desenvolvimento
- **100+** Endpoints documentados
- **50+** Componentes especificados
- **20+** Padrões definidos
- **5** Checklists de validação

## 🔒 Políticas

### Documentação Obrigatória
Todo código deve incluir:
- Comentários JSDoc para funções públicas
- README em novos módulos
- Atualização de docs existentes
- Exemplos de uso

### Revisão de Docs
- PR deve incluir docs atualizados
- QA valida documentação
- Aprovação requer docs completos

## 📞 Contato

**Dúvidas sobre documentação?**
- Consulte [README principal](../README.md)
- Verifique [Instruções IA](../CLAUDE.md)
- Abra issue no repositório

---

**Última atualização:** 23/09/2025  
**Versão:** 1.0.0  
**Mantenedor:** Time de Desenvolvimento i9 Smart