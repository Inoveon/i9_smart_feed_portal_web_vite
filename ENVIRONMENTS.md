# 🌍 Ambientes - i9 Smart Feed Portal

## 📁 Estrutura de Arquivos de Ambiente

O projeto utiliza arquivos `.env.*` específicos para cada ambiente:

```
.env.development  # Desenvolvimento local
.env.homolog     # Servidor de homologação
.env.production  # Servidor de produção
```

## 🔧 Configuração dos Ambientes

### 🟢 Desenvolvimento Local
- **Arquivo**: `.env.development`
- **API**: `http://localhost:8000`
- **Frontend**: `http://localhost:5173`
- **Uso**: `npm run dev`

### 🟡 Homologação
- **Arquivo**: `.env.homolog`
- **Servidor**: `10.0.20.11`
- **API**: `http://10.0.20.11:8001`
- **Frontend**: `http://10.0.20.11:3001`
- **Deploy**: `make deploy-homolog`

### 🔴 Produção
- **Arquivo**: `.env.production`
- **Servidor**: `172.16.2.90`
- **API**: `http://172.16.2.90:8001`
- **Frontend**: `http://172.16.2.90:3001`
- **Deploy**: `make deploy-production`

## 📝 Formato dos Arquivos de Ambiente

Todos os arquivos seguem o mesmo padrão:

```bash
# Configurações de Deploy para [AMBIENTE]
export SSH_USER="usuario"
export SSH_HOST="ip.do.servidor"
export SSH_KEY="/path/to/ssh/key"
export SSH_PORT="22"
export REMOTE_DIR="/docker/i9-smart/feed"
export API_HOST="ip.do.servidor"
export API_PORT="8001"
```

## 🚀 Comandos por Ambiente

### Desenvolvimento
```bash
# Iniciar desenvolvimento
npm run dev

# Build local
npm run build

# Testes
npm run test
```

### Homologação
```bash
# Deploy
make deploy-homolog

# Status
make homolog-status

# Logs
make homolog-logs

# Reiniciar
make homolog-restart
```

### Produção
```bash
# Deploy com confirmação
make deploy-production

# Deploy direto
make deploy-production-quick

# Status
make production-status

# Logs
make production-logs

# Reiniciar
make production-restart
```

## 🔍 Verificação Geral

```bash
# Ver configurações de todos os ambientes
make deploy-info

# Testar build local
npm run build

# Verificar tipos TypeScript
npm run type-check

# Lint
npm run lint
```

## ⚠️ Importante

1. **Nunca commitar arquivos .env**: Todos os arquivos `.env.*` estão no `.gitignore`
2. **Testar em homologação primeiro**: Sempre faça deploy em homologação antes de produção
3. **Backup antes de produção**: Faça backup antes de qualquer deploy em produção
4. **Monitorar após deploy**: Sempre verifique logs após o deploy

## 📊 Fluxo de Deploy

```
Desenvolvimento → Homologação → Produção
     ↓               ↓              ↓
  localhost      10.0.20.11    172.16.2.90
   (local)       (homolog)     (production)
```

## 🔐 SSH e Segurança

- Chave SSH única: `/Users/leechardes/.ssh/id_rsa_i9_deploy`
- Usada em todos os ambientes
- Configure com: `make setup-ssh`

## 🐳 Docker

Todos os ambientes usam a mesma estrutura Docker:
- **Imagem**: `i9-campaigns`
- **Container**: `i9-campaigns-frontend`
- **Porta**: `3001`
- **Diretório**: `/docker/i9-smart/feed`

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs: `make [ambiente]-logs`
2. Verifique o status: `make [ambiente]-status`
3. Reinicie se necessário: `make [ambiente]-restart`
4. Contate: Lee Chardes