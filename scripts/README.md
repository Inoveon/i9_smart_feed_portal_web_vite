# 📁 Scripts - i9 Smart Feed Portal

Esta pasta contém todos os scripts de automação do projeto.

## 🚀 Scripts Disponíveis

### deploy.sh
Script unificado para deploy em todos os ambientes.

**Uso:**
```bash
# Desenvolvimento
./scripts/deploy.sh development

# Homologação
./scripts/deploy.sh homolog

# Produção
./scripts/deploy.sh production
```

**Funcionalidades:**
- Build automático do projeto
- Deploy via Docker
- Suporte a múltiplos ambientes
- Confirmação de segurança para produção

### setup-ssh.sh
Configura chave SSH para acesso aos servidores.

**Uso:**
```bash
./scripts/setup-ssh.sh
```

**Funcionalidades:**
- Gera chave SSH (se não existir)
- Configura acesso para homologação e produção
- Atualiza arquivo SSH config
- Testa conexões

## 🔧 Configuração

Os scripts utilizam arquivos de ambiente localizados na raiz do projeto:
- `.env.development` - Configurações de desenvolvimento
- `.env.homolog` - Configurações de homologação
- `.env.production` - Configurações de produção

## 📋 Pré-requisitos

- Node.js e npm instalados
- Docker instalado nos servidores
- SSH configurado
- Permissões de acesso aos servidores

## 🎯 Uso via Makefile

Todos os scripts podem ser executados através do Makefile:

```bash
# Deploy
make deploy-development
make deploy-homolog
make deploy-production

# Configuração SSH
make setup-ssh
```

## ⚠️ Importante

- Sempre teste em homologação antes de produção
- Faça backup antes de deploy em produção
- Mantenha as credenciais seguras
- Não commitar arquivos `.env`

## 📞 Suporte

Em caso de problemas, contate: Lee Chardes