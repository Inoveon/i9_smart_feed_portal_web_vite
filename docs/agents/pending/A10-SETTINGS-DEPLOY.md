# A10 - Configurações e Deploy

## ⚠️ REGRAS FUNDAMENTAIS - LEIA PRIMEIRO

### NUNCA FAZER:
- ❌ Criar configurações que a API não suporta
- ❌ Assumir endpoints de settings sem testar
- ❌ Implementar features de usuário sem verificar API
- ❌ Criar processo de deploy sem validar ambiente
- ❌ Usar valores hardcoded de produção

### SEMPRE FAZER:
- ✅ Testar endpoints de user/settings primeiro
- ✅ Verificar se API suporta alteração de perfil
- ✅ Confirmar estrutura de dados do usuário
- ✅ Validar ambiente de deploy antes de configurar
- ✅ Seguir `docs/agents/shared/REACT-VITE-STANDARDS.md`

## 📋 Objetivo
Implementar configurações baseadas EXCLUSIVAMENTE no que a API oferece e preparar deploy adequado ao ambiente real.

## 📚 Referências Obrigatórias
- **API Documentation**: `docs/API-DOCUMENTATION.md` - Endpoints de User/Settings
- **Padrões de Código**: `docs/agents/shared/REACT-VITE-STANDARDS.md`
- **Auth Store**: `src/stores/auth.store.ts` (verificar estrutura de user)

## 🔍 FASE 1 - ANÁLISE OBRIGATÓRIA (Executar Primeiro!)

### 1.1 Verificar Endpoints de Configurações
```bash
# Obter token
TOKEN=$(curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" \
  2>/dev/null | jq -r '.access_token')

# 1. Verificar dados do usuário atual
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq

# 2. Verificar se pode atualizar perfil
curl -X PUT "http://localhost:8000/api/auth/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' -w "\nStatus: %{http_code}\n"

# 3. Verificar se pode alterar senha
curl -X POST "http://localhost:8000/api/auth/change-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current_password": "", "new_password": ""}' -w "\nStatus: %{http_code}\n"

# 4. Verificar se existe endpoint de settings
curl -X GET "http://localhost:8000/api/settings" \
  -H "Authorization: Bearer $TOKEN" -w "\nStatus: %{http_code}\n"

# 5. Verificar health check
curl -X GET "http://localhost:8000/api/health" | jq
```

### 1.2 Verificar Estrutura de Usuário
```bash
# Ver como usuário é armazenado
cat src/stores/auth.store.ts | grep -A 10 "interface.*User"

# Ver campos disponíveis
grep -n "user" src/stores/auth.store.ts
```

### 1.3 Verificar Ambiente de Deploy
```bash
# Verificar se já existe configuração
ls -la | grep -E "Dockerfile|docker-compose|nginx"

# Verificar scripts de build
grep -n "build" package.json
```

## 🛠️ FASE 2 - IMPLEMENTAÇÃO

### 2.1 Decidir Funcionalidades

**Configurações Suportadas pela API:**
- Implementar apenas o que API oferece
- Não criar campos fictícios

**Configurações Locais (Frontend):**
- Tema (dark/light) - localStorage
- Idioma (se implementado) - localStorage
- Outras preferências visuais

### 2.2 Página de Configurações Básica

```typescript
// src/pages/settings/index.tsx

export function SettingsPage() {
  const user = useAuthStore(state => state.user)
  const { theme, setTheme } = useTheme()
  
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        
        <div className="grid gap-6">
          {/* Tema - Local */}
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label>Tema</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Perfil - SE API suporta */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Informações do Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Usuário:</strong> {user.username}</p>
                  <p><strong>Email:</strong> {user.email || 'Não informado'}</p>
                  {/* APENAS campos que existem */}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Informar limitações */}
          <Alert>
            <AlertDescription>
              Para alterar senha ou outras configurações, 
              entre em contato com o administrador.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </AppLayout>
  )
}
```

### 2.3 Alterar Senha (SE suportado)

```typescript
// APENAS implementar se endpoint confirmado

const changePasswordMutation = useMutation({
  mutationFn: async (data: ChangePasswordData) => {
    // Verificar endpoint real primeiro
    const response = await api.post('/auth/change-password', data)
    return response.data
  },
  onSuccess: () => {
    toast.success('Senha alterada com sucesso')
  },
  onError: () => {
    toast.error('Erro ao alterar senha')
  }
})
```

### 2.4 Dockerfile (BÁSICO)

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2.5 nginx.conf (SIMPLES)

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2.6 Scripts de Build

```json
// package.json - adicionar apenas necessário
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx",
    "docker:build": "docker build -t i9-campaigns-portal .",
    "docker:run": "docker run -p 3000:80 i9-campaigns-portal"
  }
}
```

### 2.7 Variáveis de Ambiente

```bash
# .env.example
VITE_API_URL=http://localhost:8000/api

# NÃO criar .env.production com valores reais
# Deixar para configurar no servidor
```

## ✅ Checklist de Validação

### Antes de Começar
- [ ] Testei endpoint /api/auth/me
- [ ] Verifiquei se pode alterar perfil
- [ ] Confirmei se pode alterar senha
- [ ] Entendi estrutura de user
- [ ] Verifiquei ambiente de deploy

### Durante Implementação
- [ ] Usando APENAS campos reais de user
- [ ] Configurações locais em localStorage
- [ ] Sem funcionalidades não suportadas
- [ ] Docker build funcionando

### Depois de Implementar
- [ ] Tema persiste após reload
- [ ] Informações de usuário corretas
- [ ] Build de produção funciona
- [ ] Docker image criada com sucesso

## 📊 Resultado Esperado
- Página de configurações funcional
- Apenas opções suportadas
- Deploy básico configurado
- Sem complexidade desnecessária

## 🚨 IMPORTANTE

### Se API não tem settings:
```typescript
// Implementar apenas configurações locais
const localSettings = {
  theme: localStorage.getItem('theme') || 'light',
  // outras configs locais
}
```

### Deploy Simplificado:
- Usar nginx básico
- Evitar complexidade desnecessária
- Documentar processo claramente

## 📝 Notas de Execução
O agente deve preencher durante execução:

```markdown
### Endpoints Testados:
- [ ] GET /api/auth/me - Status: ___
- [ ] PUT /api/auth/profile - Status: ___
- [ ] POST /api/auth/change-password - Status: ___
- [ ] GET /api/settings - Status: ___
- [ ] GET /api/health - Status: ___

### Estrutura de User:
```json
// Colar estrutura REAL aqui
```

### Funcionalidades Possíveis:
- [ ] Alterar tema (local)
- [ ] Ver informações do usuário
- [ ] Alterar senha
- [ ] Atualizar perfil
- [ ] Outras: ___

### Deploy:
- [ ] Dockerfile criado
- [ ] nginx.conf configurado
- [ ] Build de produção testado
- [ ] Docker image funciona
```