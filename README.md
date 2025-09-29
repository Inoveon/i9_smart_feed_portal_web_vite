# 🚀 i9 Smart Feed Portal - Vite + React + Shadcn/UI

Portal administrativo moderno para gerenciamento de feed de conteúdo com tema dark/light, desenvolvido com Vite, React, TypeScript e Shadcn/UI.

## 📋 Sobre o Projeto

Sistema completo para criação, edição, agendamento e monitoramento de feed de conteúdo em múltiplos postos/estações. Interface profissional com componentes reutilizáveis e padrões rígidos de desenvolvimento.

## 🛠️ Stack Tecnológica

### Core
- **Vite 5** - Build tool ultra-rápido com HMR < 100ms
- **React 18** - Biblioteca UI moderna
- **TypeScript 5** - Type safety e melhor DX
- **Tailwind CSS 3** - Utility-first CSS framework
- **Shadcn/UI** - Componentes profissionais e acessíveis

### Estado e Dados
- **Zustand** - Estado global simples e performático
- **React Query (TanStack)** - Cache e sincronização com servidor
- **React Router v6** - Roteamento SPA

### Formulários
- **React Hook Form** - Gerenciamento eficiente de formulários
- **Zod** - Validação de schemas com TypeScript

### Utilitários
- **Axios** - Cliente HTTP robusto
- **date-fns** - Manipulação de datas
- **Sonner** - Notificações toast elegantes

## 🎨 Funcionalidades

- ✅ **Autenticação JWT** com refresh token automático
- ✅ **Dashboard** com métricas em tempo real
- ✅ **CRUD Completo** de feeds
- ✅ **Upload de Imagens** com preview
- ✅ **Seleção de Estações** multiselect
- ✅ **Tema Dark/Light** com persistência
- ✅ **Layout Responsivo** mobile-first
- ✅ **Loading States** e error handling
- ✅ **Validação de Formulários** com feedback visual

## 📁 Estrutura do Projeto

```
i9_smart_feed_portal_web_vite/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes Shadcn/UI (NÃO MODIFICAR)
│   │   ├── layouts/         # AppLayout, AuthLayout
│   │   └── features/        # Componentes de negócio
│   ├── pages/
│   │   ├── auth/            # Login, registro
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── feeds/           # Gestão de feeds
│   │   └── settings/        # Configurações
│   ├── services/            # Camada de API
│   ├── stores/              # Estados Zustand
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilitários
│   └── styles/
│       └── globals.css      # Tailwind + temas
├── docs/
│   ├── agents/              # Agentes de desenvolvimento
│   └── API-DOCUMENTATION.md
├── docs/agents/shared/
│   └── REACT-VITE-STANDARDS.md  # Padrões obrigatórios
├── CLAUDE.md               # Instruções para IA
└── README.md               # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- API rodando em http://10.0.10.116:8000

### Instalação

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre no diretório
cd i9_smart_feed_portal_web_vite

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações
```

### Desenvolvimento

```bash
# Inicia servidor de desenvolvimento
npm run dev

# Servidor rodará em http://localhost:5173
```

### Build de Produção

```bash
# Cria build otimizado
npm run build

# Preview do build
npm run preview
```

## 🧪 Qualidade de Código

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatar código
npm run format

# Executar todos os checks
npm run check
```

## 📐 Padrões de Desenvolvimento

### ⚠️ IMPORTANTE
Este projeto segue padrões RÍGIDOS documentados em `docs/agents/shared/REACT-VITE-STANDARDS.md`. **TODOS** os desenvolvedores devem:

1. Ler `docs/agents/shared/REACT-VITE-STANDARDS.md` antes de codificar
2. Seguir EXATAMENTE os padrões estabelecidos
3. NUNCA criar exceções aos padrões

### Principais Regras:
- ✅ **SEMPRE** usar componentes de `@/components/ui/`
- ✅ **SEMPRE** usar Tailwind CSS (sem CSS customizado)
- ✅ **SEMPRE** usar variáveis de tema para cores
- ✅ **SEMPRE** usar React Query para API calls
- ❌ **NUNCA** usar `style={{}}` inline
- ❌ **NUNCA** hardcode cores
- ❌ **NUNCA** criar componentes que já existem

## 🤖 Desenvolvimento com IA

Para desenvolvedores usando Claude ou outras IAs, leia `CLAUDE.md` para instruções específicas sobre:
- Estrutura de arquivos obrigatória
- Padrões de código que devem ser seguidos
- Checklist antes de commitar
- Exemplos de código correto

## 📊 Agentes de Desenvolvimento

O projeto possui agentes automatizados para cada fase:

- **A01-SETUP-BASE** - Configuração inicial do projeto
- **A02-LAYOUTS-COMPONENTS** - Layouts e componentes base
- **A03-AUTH-SYSTEM** - Sistema de autenticação completo
- **A04-DASHBOARD** - Dashboard com métricas
- **A05-FEEDS-CRUD** - CRUD de feeds

Para executar um agente:
```bash
# Leia a documentação do agente
cat docs/agents/pending/A01-SETUP-BASE.md

# Execute as tarefas conforme documentado
```

## 🔒 Segurança

- JWT tokens com refresh automático
- Interceptors para autenticação
- Validação de inputs com Zod
- Sanitização de dados
- CORS configurado corretamente

## 🎯 Métricas de Performance

### Targets:
- Build size < 200KB (gzipped)
- HMR < 100ms
- Lighthouse Score > 90
- 0 erros TypeScript
- 100% componentes reutilizados

## 🐛 Troubleshooting

### Erro de CORS
```bash
# Certifique-se que a API está rodando
# Verifique VITE_API_URL no .env
```

### Tema não persiste
```bash
# Limpe localStorage
localStorage.clear()
# Recarregue a página
```

## 📝 Licença

MIT License

## 👥 Contribuindo

1. Leia `docs/agents/shared/REACT-VITE-STANDARDS.md` completamente
2. Siga os padrões estabelecidos
3. Teste em ambos os temas (dark/light)
4. Garanta 0 erros de TypeScript
5. Faça PR com descrição clara

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação em `/docs`
2. Consulte `docs/agents/shared/REACT-VITE-STANDARDS.md` para padrões
3. Leia `CLAUDE.md` se usando IA
4. Abra uma issue no repositório

---

**Desenvolvido com ❤️ seguindo padrões profissionais e melhores práticas**