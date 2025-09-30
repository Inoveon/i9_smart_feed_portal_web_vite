# 🚀 Guia de Deploy - i9 Smart Feed Portal

## 📋 Configurações Padronizadas

### Estrutura Comum
- **Diretório Remoto**: `/docker/i9-smart/feed`
- **Porta**: `3001`
- **Container**: `i9-campaigns-frontend`
- **Imagem**: `i9-campaigns`
- **Chave SSH**: `/Users/leechardes/.ssh/id_rsa_i9_deploy`

### Ambientes

#### 🟡 Homologação
- **Servidor**: `10.0.20.11`
- **Usuário**: `lee`
- **API**: `http://10.0.20.11:8001`
- **URL**: `http://10.0.20.11:3001`

#### 🔴 Produção
- **Servidor**: `172.16.2.90`
- **Usuário**: `i9on`
- **Senha**: `aldo$2024` (caso precise)
- **API**: `http://172.16.2.90:8001`
- **URL**: `http://172.16.2.90:3001`

## 🔧 Configuração Inicial

### 1. Configurar SSH (uma vez só)
```bash
# Gera/configura chave SSH para ambos ambientes
make setup-ssh
```

### 2. Verificar Conexão
```bash
# Testar homologação
ssh lee@10.0.20.11

# Testar produção
ssh i9on@172.16.2.90
```

## 🚀 Deploy

### Deploy para Homologação
```bash
make deploy-homolog
```

### Deploy para Produção
```bash
# Com confirmação de segurança
make deploy-production

# Sem confirmação (cuidado!)
make deploy-production-quick
```

## 📊 Monitoramento

### Comandos Gerais
```bash
# Ver status dos containers
make deploy-status       # Homologação
make production-status   # Produção

# Ver logs
make deploy-logs         # Homologação
make production-logs     # Produção

# Reiniciar container
make deploy-restart      # Homologação  
make production-restart  # Produção
```

### Acessar Servidores via SSH
```bash
# Homologação
ssh lee@10.0.20.11

# Produção
ssh i9on@172.16.2.90
```

### Comandos no Servidor

```bash
# Listar containers
docker ps

# Ver logs
docker logs i9-campaigns-frontend

# Reiniciar container
docker restart i9-campaigns-frontend

# Parar container
docker stop i9-campaigns-frontend

# Remover container
docker rm i9-campaigns-frontend

# Ver imagens
docker images | grep i9-campaigns
```

## 🔍 Verificação

### Testar Aplicação
```bash
# Homologação
curl http://10.0.20.11:3001
open http://10.0.20.11:3001

# Produção
curl http://172.16.2.90:3001
open http://172.16.2.90:3001
```

### Testar API (através do proxy)
```bash
# Homologação
curl http://10.0.20.11:3001/api/health

# Produção
curl http://172.16.2.90:3001/api/health
```

## 🐛 Troubleshooting

### Container não está rodando
```bash
# Verificar logs do container
docker logs i9-campaigns-frontend

# Verificar se porta está em uso
lsof -i :3001

# Rebuild manual
cd /docker/i9-smart/feed
docker build -t i9-campaigns:latest .
docker run -d -p 3001:80 --name i9-campaigns-frontend i9-campaigns:latest
```

### Erro de permissão
```bash
# No servidor, dar permissões
sudo chown -R $USER:$USER /docker/i9-smart/feed
```

### Build falha localmente
```bash
# Limpar e reconstruir
npm run clean
npm install
npm run build
```

## 📁 Estrutura de Arquivos

### Arquivos de Configuração
- `.env.deploy` - Variáveis de homologação
- `.env.production` - Variáveis de produção
- `nginx.conf` - Configuração Nginx homologação
- `nginx.production.conf` - Configuração Nginx produção

### Scripts de Deploy (pasta scripts/)
- `scripts/deploy.sh` - Script unificado para todos os ambientes
- `scripts/setup-ssh.sh` - Configuração SSH

### Docker
- `Dockerfile` - Imagem Docker
- `docker-compose.yml` - Orquestração homologação
- `docker-compose.production.yml` - Orquestração produção

## ⚠️ Cuidados

1. **Sempre teste em homologação primeiro**
2. **Verifique o build local antes do deploy**
3. **Faça backup antes de deploy em produção**
4. **Monitore logs após deploy**
5. **Mantenha as senhas seguras**

## 🔄 Fluxo de Deploy Recomendado

1. Desenvolver e testar localmente
2. Commit e push para git
3. Deploy para homologação
4. Testar em homologação
5. Se aprovado, deploy para produção
6. Monitorar produção

## 📞 Contatos

- **DevOps**: Lee Chardes
- **Servidor Homolog**: 10.0.20.11
- **Servidor Produção**: 172.16.2.90