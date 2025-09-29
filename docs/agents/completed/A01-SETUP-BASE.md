# A01 - Setup Base do Projeto Vite + React + Shadcn/UI

## 📋 Objetivo
Criar a estrutura base do projeto com Vite, React, TypeScript, Tailwind CSS e Shadcn/UI com sistema de tema dark/light.

## 📚 Referências
- **Padrões de Código**: `docs/agents/shared/REACT-VITE-STANDARDS.md`
- **API Documentation**: `docs/API-DOCUMENTATION.md` (para entendimento geral)

## 🎯 Tarefas

### 1. Inicializar Projeto Vite
```bash
npm create vite@latest . -- --template react-ts
npm install
```

### 2. Instalar Dependências Core
```bash
# Tailwind CSS e utilitários
npm install -D tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge lucide-react

# Estado e Roteamento
npm install zustand @tanstack/react-query react-router-dom

# Formulários e Validação
npm install react-hook-form zod @hookform/resolvers

# HTTP e Utilitários
npm install axios date-fns sonner
```

### 3. Configurar Tailwind CSS
- Criar `tailwind.config.ts` com variáveis CSS para temas
- Criar `postcss.config.js`
- Configurar `src/styles/globals.css` com @layer base

### 4. Configurar Shadcn/UI
```bash
npx shadcn-ui@latest init
```
- Escolher: Default style, Slate base color, CSS variables

### 5. Implementar Sistema de Tema
```typescript
// src/hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  
  return { theme, setTheme }
}
```

### 6. Criar Estrutura de Pastas
```
src/
├── components/
│   ├── ui/              # Componentes Shadcn/UI
│   ├── layouts/         # AuthLayout, AppLayout
│   └── features/        # Componentes de negócio
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── campaigns/
│   └── settings/
├── services/
│   ├── api.ts          # Configuração Axios
│   └── auth.service.ts
├── hooks/
├── lib/
│   └── utils.ts
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

### 7. Configurar Path Aliases
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 8. Configurar Vite
```typescript
// vite.config.ts
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

## ✅ Checklist de Validação
- [ ] Projeto Vite criado e funcionando
- [ ] Tailwind CSS configurado e funcionando
- [ ] Shadcn/UI instalado e configurado
- [ ] Sistema de tema dark/light funcionando
- [ ] Path aliases configurados
- [ ] Estrutura de pastas criada
- [ ] Hot reload < 100ms
- [ ] Build sem erros

## 📊 Resultado Esperado
- Servidor de desenvolvimento rodando em http://localhost:5173
- Toggle de tema funcionando
- Tailwind CSS aplicado
- Componentes Shadcn/UI disponíveis
- TypeScript sem erros

## 🚨 Pontos de Atenção
- NÃO instalar componentes UI ainda
- NÃO criar rotas ainda  
- NÃO configurar autenticação ainda
- Focar apenas na base técnica## 📚 Documentação de Referência

**IMPORTANTE:** Sempre consulte `docs/agents/shared/REACT-VITE-STANDARDS.md` para padrões de código obrigatórios antes de implementar.
