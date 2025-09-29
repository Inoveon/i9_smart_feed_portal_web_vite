# 🚀 Deploy em Homologação - Gateway Inoveon

## Configuração Rápida

### 1. Build para Homologação
```bash
# Gera build com paths relativos (sem VITE_API_URL)
make homolog-build
```

### 2. Servir Aplicação
```bash
# Inicia servidor na porta 3000
make homolog-serve
```

### 3. Testar Localmente
```bash
# Verifica se está rodando
curl http://10.0.10.116:3000
```

## 📋 Checklist de Deploy

- [x] **Frontend usando paths relativos** → `/api/*`
- [x] **Build sem VITE_API_URL** → `VITE_API_URL=` ou vazio
- [x] **Servidor na porta 3000** → `serve dist -p 3000`
- [ ] **Backend API rodando na 8000** → Verificar separadamente
- [ ] **Configurado no Admin Panel** → Ver seção abaixo

## 🔧 Configuração no Admin Panel do Gateway

```yaml
Nome: campanhas
Path: /campanhas
Backend Frontend: http://10.0.10.116:3000
Backend API: http://10.0.10.116:8000
Strip Prefix: ✅
Tipo: standard
```

## 🌐 URLs de Acesso

### Via Gateway (HTTPS)
- Frontend: `https://main.inoveon.com.br/campanhas/`
- API: `https://main.inoveon.com.br/api/*`

### Acesso Direto (HTTP - apenas teste)
- Frontend: `http://10.0.10.116:3000`
- API: `http://10.0.10.116:8000`

## 🔍 Como o Gateway Funciona

```
Browser → Gateway → Roteamento
         ├── /campanhas/* → 10.0.10.116:3000 (Frontend)
         └── /api/*       → 10.0.10.116:8000 (Backend)
```

### Exemplo de Requisição
1. Browser faz: `fetch('/api/campaigns')`
2. URL completa: `https://main.inoveon.com.br/api/campaigns`
3. Gateway roteia para: `http://10.0.10.116:8000/api/campaigns`
4. Resposta retorna pelo mesmo caminho

## ⚠️ Troubleshooting

### Erro: "Não foi possível conectar à API"

**Causa:** Frontend usando URL absoluta
```bash
# Verificar se VITE_API_URL está vazio
cat .env | grep VITE_API_URL

# Refazer build sem URL
VITE_API_URL= npm run build
```

### Erro: Mixed Content (HTTPS/HTTP)

**Causa:** Usando URLs absolutas com HTTP
**Solução:** Sempre usar paths relativos (`/api/...`)

### Erro: CORS bloqueado

**Causa:** Requisições diretas sem passar pelo Gateway
**Solução:** Acessar sempre via `https://main.inoveon.com.br/campanhas/`

## 📝 Scripts Úteis

```bash
# Build para homologação
make homolog-build

# Servir em homologação
make homolog-serve

# Build e servir
make homolog-serve

# Testar API
make homolog-test

# Logs do servidor
pm2 logs campanhas-frontend
```

## 🎯 Processo Completo de Deploy

### No servidor 10.0.10.116:

```bash
# 1. Clonar/atualizar código
cd /home/deploy/campanhas
git pull origin main

# 2. Instalar dependências
npm install

# 3. Build para homologação
make homolog-build

# 4. Parar servidor anterior (se existir)
pm2 stop campanhas-frontend

# 5. Iniciar novo servidor
pm2 start "npx serve dist -p 3000 -s" --name campanhas-frontend

# 6. Salvar configuração PM2
pm2 save
pm2 startup
```

## 🔐 Variáveis de Ambiente

Para homologação via Gateway, o `.env` deve ter:

```env
# API Configuration - VAZIO para usar paths relativos
VITE_API_URL=
# Ou simplesmente não definir

# Outras configs permanecem
VITE_APP_NAME="i9 Smart Campaigns Portal"
VITE_APP_VERSION=1.0.0
```

## ✅ Validação Final

1. **Frontend acessível:** `https://main.inoveon.com.br/campanhas/`
2. **Login funcional:** Credenciais aceitas
3. **API respondendo:** Dados carregando corretamente
4. **Navegação OK:** Links internos funcionando
5. **Assets carregando:** CSS, JS, imagens OK

---

**Última atualização:** 2024-01-24
**Responsável:** DevOps Team
**Contato:** suporte@inoveon.com.br