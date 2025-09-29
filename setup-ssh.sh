#!/bin/bash

# Script de Configuração de Chave SSH para Deploy
# Configura autenticação via chave SSH para o servidor de deploy

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
SERVER_HOST="10.0.20.11"
SSH_KEY_PATH="$HOME/.ssh/id_rsa_i9_deploy"
ENV_FILE=".env.deploy"

echo -e "${GREEN}🔐 Configuração de Chave SSH para Deploy${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# 1. Verificar/Configurar variável de ambiente SSH_USER
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
fi

if [ -z "$SSH_USER" ]; then
    echo -e "${YELLOW}📝 Configuração inicial necessária${NC}"
    read -p "Digite o usuário SSH para o servidor: " input_user
    SSH_USER="${input_user}"
    
    # Salvar no arquivo de ambiente
    echo "# Configurações de Deploy" > "$ENV_FILE"
    echo "export SSH_USER=\"$SSH_USER\"" >> "$ENV_FILE"
    echo "export SSH_HOST=\"$SERVER_HOST\"" >> "$ENV_FILE"
    echo "export SSH_KEY=\"$SSH_KEY_PATH\"" >> "$ENV_FILE"
    
    echo -e "${GREEN}✅ Variável SSH_USER salva em $ENV_FILE${NC}"
    echo ""
    
    # Adicionar ao .gitignore se não estiver
    if ! grep -q "^.env.deploy$" .gitignore 2>/dev/null; then
        echo ".env.deploy" >> .gitignore
        echo -e "${YELLOW}📝 Adicionado $ENV_FILE ao .gitignore${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  Usando usuário: ${SSH_USER}${NC}"
    read -p "Pressione Enter para continuar ou digite um novo usuário: " new_user
    if [ ! -z "$new_user" ]; then
        SSH_USER="$new_user"
        sed -i.bak "s/export SSH_USER=.*/export SSH_USER=\"$SSH_USER\"/" "$ENV_FILE"
        echo -e "${GREEN}✅ Usuário atualizado${NC}"
    fi
fi

echo ""

# 2. Pedir senha para configuração inicial
echo -e "${YELLOW}🔑 Digite a senha para ${SSH_USER}@${SERVER_HOST}${NC}"
echo -e "${BLUE}(Senha necessária apenas para configuração inicial)${NC}"
read -s -p "Senha: " SSH_PASSWORD
echo ""
echo ""

# 3. Testar conexão com senha
echo -e "${YELLOW}🔍 Testando conexão com o servidor...${NC}"
if sshpass -p "$SSH_PASSWORD" ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${SSH_USER}@${SERVER_HOST} "echo 'Conexão OK'" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexão com senha bem-sucedida${NC}"
else
    echo -e "${RED}❌ Erro: Não foi possível conectar. Verifique usuário e senha.${NC}"
    exit 1
fi

# 4. Verificar se já existe chave configurada
echo ""
echo -e "${YELLOW}🔍 Verificando configuração de chave SSH existente...${NC}"

if [ -f "$SSH_KEY_PATH" ]; then
    echo -e "${BLUE}ℹ️  Chave SSH encontrada em $SSH_KEY_PATH${NC}"
    
    # Testar se a chave funciona
    if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" ${SSH_USER}@${SERVER_HOST} "echo 'OK'" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Chave SSH já está configurada e funcionando!${NC}"
        echo ""
        echo -e "${BLUE}ℹ️  Para fazer deploy, use:${NC}"
        echo -e "    ${YELLOW}make deploy-homolog${NC}"
        echo -e "    ${YELLOW}./deploy.sh homolog${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Chave existe mas não está autorizada no servidor${NC}"
    fi
else
    echo -e "${YELLOW}📝 Chave SSH não encontrada. Será criada uma nova.${NC}"
fi

# 5. Gerar chave SSH se não existir
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo ""
    echo -e "${YELLOW}🔑 Gerando nova chave SSH...${NC}"
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "i9-deploy@${HOSTNAME}"
    echo -e "${GREEN}✅ Chave SSH gerada${NC}"
fi

# 6. Copiar chave para o servidor
echo ""
echo -e "${YELLOW}📤 Copiando chave pública para o servidor...${NC}"

# Criar comando para adicionar a chave
PUB_KEY=$(cat "${SSH_KEY_PATH}.pub")
sshpass -p "$SSH_PASSWORD" ssh ${SSH_USER}@${SERVER_HOST} "
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    echo '$PUB_KEY' >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
"

echo -e "${GREEN}✅ Chave pública adicionada ao servidor${NC}"

# 7. Testar conexão com chave
echo ""
echo -e "${YELLOW}🧪 Testando conexão com chave SSH...${NC}"

if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" ${SSH_USER}@${SERVER_HOST} "echo 'Teste bem-sucedido'" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexão com chave SSH funcionando perfeitamente!${NC}"
else
    echo -e "${RED}❌ Erro ao conectar com chave SSH${NC}"
    exit 1
fi

# 8. Configurar SSH config para facilitar
echo ""
echo -e "${YELLOW}📝 Configurando SSH config...${NC}"

SSH_CONFIG="$HOME/.ssh/config"
if ! grep -q "Host i9-deploy" "$SSH_CONFIG" 2>/dev/null; then
    cat >> "$SSH_CONFIG" << EOF

# i9 Smart Deploy Server
Host i9-deploy
    HostName ${SERVER_HOST}
    User ${SSH_USER}
    IdentityFile ${SSH_KEY_PATH}
    StrictHostKeyChecking no
EOF
    echo -e "${GREEN}✅ Configuração SSH adicionada${NC}"
else
    echo -e "${BLUE}ℹ️  Configuração SSH já existe${NC}"
fi

# 9. Criar alias no bash profile
echo ""
echo -e "${YELLOW}📝 Configurando aliases...${NC}"

SHELL_PROFILE="$HOME/.zshrc"
if [ ! -f "$SHELL_PROFILE" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
fi

if ! grep -q "alias i9-ssh" "$SHELL_PROFILE" 2>/dev/null; then
    echo "" >> "$SHELL_PROFILE"
    echo "# i9 Smart Deploy Aliases" >> "$SHELL_PROFILE"
    echo "alias i9-ssh='ssh i9-deploy'" >> "$SHELL_PROFILE"
    echo "alias i9-deploy='cd $(pwd) && ./deploy.sh'" >> "$SHELL_PROFILE"
    echo -e "${GREEN}✅ Aliases configurados em $SHELL_PROFILE${NC}"
else
    echo -e "${BLUE}ℹ️  Aliases já configurados${NC}"
fi

# 10. Resumo final
echo ""
echo -e "${GREEN}🎉 Configuração Concluída com Sucesso!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}📋 Resumo da Configuração:${NC}"
echo -e "   ${BLUE}Servidor:${NC} ${SERVER_HOST}"
echo -e "   ${BLUE}Usuário:${NC} ${SSH_USER}"
echo -e "   ${BLUE}Chave SSH:${NC} ${SSH_KEY_PATH}"
echo -e "   ${BLUE}Config:${NC} ${ENV_FILE}"
echo ""
echo -e "${YELLOW}🚀 Como usar:${NC}"
echo -e "   ${GREEN}Deploy para homologação:${NC}"
echo -e "      make deploy-homolog"
echo -e "      ./deploy.sh homolog"
echo ""
echo -e "   ${GREEN}Conectar ao servidor:${NC}"
echo -e "      ssh i9-deploy"
echo -e "      i9-ssh (após recarregar terminal)"
echo ""
echo -e "   ${GREEN}Ver logs:${NC}"
echo -e "      make deploy-logs"
echo ""
echo -e "${BLUE}ℹ️  Variáveis de ambiente salvas em ${ENV_FILE}${NC}"
echo -e "${BLUE}ℹ️  Para recarregar: source ${ENV_FILE}${NC}"