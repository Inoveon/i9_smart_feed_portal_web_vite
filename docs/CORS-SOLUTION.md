# 🔧 Solução CORS - Proxy do Vite

## ❌ Problema Identificado

**"Failed to fetch"** ao tentar fazer login do navegador, mesmo com a API funcionando corretamente.

### Causa:
- Problema de CORS (Cross-Origin Resource Sharing)
- O navegador bloqueia requisições de `http://localhost:5173` (frontend) para `http://localhost:8000` (API)
- Mesmo sendo localhost, portas diferentes são consideradas origens diferentes

## ✅ Solução Implementada

### 1. Configuração de Proxy no Vite

**Arquivo:** `vite.config.ts`

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    },
    '/health': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    },
    '/docs': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### 2. URLs Relativas no Service

**Arquivo:** `src/services/auth.service.ts`

```typescript
// Em desenvolvimento, usar proxy do Vite (URLs relativas)
// Em produção, usar a URL completa da API
private baseURL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:8000')
```

## 📋 Como Funciona

### Desenvolvimento (com Proxy):
1. Frontend faz requisição para `/api/auth/login` (URL relativa)
2. Vite intercepta e redireciona para `http://localhost:8000/api/auth/login`
3. Sem problemas de CORS pois o navegador vê como mesma origem

### Produção (sem Proxy):
1. Frontend usa URL completa da API configurada em `VITE_API_URL`
2. API deve ter CORS configurado para aceitar requisições do domínio de produção

## 🚀 Testando

### 1. Reiniciar servidor dev (necessário após mudança no vite.config.ts):
```bash
# Parar servidor atual (Ctrl+C)
# Reiniciar
npm run dev
# ou
make dev
```

### 2. Testar login no navegador:
- Acessar http://localhost:5173
- Login com: admin / admin123
- Verificar console para logs de debug

### 3. Verificar proxy funcionando:
```bash
# Testar através do proxy do Vite
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

## 🔍 Debug

### Logs adicionados no service:
```javascript
console.log('🔐 Tentando login para:', username)
console.log('📡 API URL:', url)
console.log('📥 Response status:', status)
console.log('✅ Login bem-sucedido')
console.log('❌ Erro no login:', error)
```

### Verificar no Console do Navegador:
1. **Network tab:** Ver requisições e respostas
2. **Console:** Ver logs de debug
3. **Application > Local Storage:** Ver tokens salvos

## 📝 Configurações por Ambiente

### Desenvolvimento:
- **Proxy:** Ativo
- **URLs:** Relativas (`/api/...`)
- **CORS:** Não é problema

### Produção:
- **Proxy:** Não existe
- **URLs:** Absolutas (`https://api.exemplo.com/api/...`)
- **CORS:** API deve permitir origem do frontend

## ⚙️ Arquivo .env para Produção

```env
# Produção
VITE_API_URL=https://api.i9smart.com.br
```

## 🎯 Benefícios do Proxy

1. **Elimina problemas de CORS em desenvolvimento**
2. **Simula ambiente de produção (mesma origem)**
3. **Facilita desenvolvimento local**
4. **Não precisa configurar CORS na API para localhost**

## ⚠️ Importante

- **Sempre reiniciar** o servidor Vite após mudanças no `vite.config.ts`
- **Em produção**, garantir que a API tem CORS configurado
- **URLs relativas** só funcionam com proxy ativo

---

**Status:** ✅ Login funcionando com proxy do Vite
**Última atualização:** 24/01/2025