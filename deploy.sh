#!/bin/bash

# Deploy Script para i9 Smart Campaigns Portal
# Automatiza o processo de build, transferência e deploy para o servidor Docker

set -e  # Para o script se houver erro

# Carregar variáveis de ambiente se existirem
if [ -f ".env.deploy" ]; then
    source .env.deploy
fi

# Configurações
SERVER_HOST="${SSH_HOST:-10.0.20.11}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa_i9_deploy}"
REMOTE_DIR="/docker/i9-smart/campaigns"
IMAGE_NAME="i9-campaigns"
CONTAINER_NAME="i9-campaigns-frontend"
PORT="${PORT:-3001}"
ENV="${1:-homolog}"  # homolog ou production

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se SSH_USER está configurado
if [ -z "$SSH_USER" ]; then
    echo -e "${YELLOW}⚠️  Variável SSH_USER não configurada${NC}"
    echo -e "${BLUE}Por favor, execute primeiro: ${GREEN}./setup-ssh.sh${NC}"
    echo ""
    read -p "Ou digite o usuário SSH agora: " SSH_USER
    if [ -z "$SSH_USER" ]; then
        echo -e "${RED}❌ Usuário SSH é obrigatório${NC}"
        exit 1
    fi
fi

# Verificar se a chave SSH existe
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ Chave SSH não encontrada em: $SSH_KEY${NC}"
    echo -e "${BLUE}Execute: ${GREEN}./setup-ssh.sh${NC} para configurar a autenticação SSH"
    exit 1
fi

# Função para executar comandos SSH
ssh_exec() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${SSH_USER}@${SERVER_HOST} "$@"
}

# Função para copiar arquivos via SCP
scp_copy() {
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r "$@" ${SSH_USER}@${SERVER_HOST}:${REMOTE_DIR}/
}

echo -e "${GREEN}🚀 Iniciando deploy para ${ENV}${NC}"

# 1. Build local do projeto
echo -e "${YELLOW}📦 Fazendo build do projeto...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Erro: Diretório dist não foi criado${NC}"
    exit 1
fi

# 2. Criar estrutura no servidor (se não existir)
echo -e "${YELLOW}📁 Criando estrutura de diretórios no servidor...${NC}"
# Primeiro tentar criar sem sudo
if ! ssh_exec "mkdir -p ${REMOTE_DIR} 2>/dev/null"; then
    # Se falhar, pedir senha para sudo
    echo -e "${YELLOW}🔑 Permissão de sudo necessária para criar diretórios${NC}"
    read -s -p "Digite a senha de sudo para ${SSH_USER}: " SUDO_PASS
    echo ""
    ssh_exec "echo '${SUDO_PASS}' | sudo -S mkdir -p ${REMOTE_DIR} && sudo chown -R ${SSH_USER}:${SSH_USER} /docker/i9-smart"
fi

# 3. Transferir arquivos
echo -e "${YELLOW}📤 Transferindo arquivos para o servidor...${NC}"
scp_copy dist Dockerfile nginx.conf docker-compose.yml .dockerignore

# 4. Build da imagem Docker no servidor
echo -e "${YELLOW}🐳 Fazendo build da imagem Docker...${NC}"
ssh_exec "cd ${REMOTE_DIR} && docker build -t ${IMAGE_NAME}:${ENV} ."

# 5. Parar container anterior (se existir)
echo -e "${YELLOW}🛑 Parando container anterior (se existir)...${NC}"
ssh_exec "docker stop ${CONTAINER_NAME} 2>/dev/null || true && docker rm ${CONTAINER_NAME} 2>/dev/null || true"

# 6. Iniciar novo container
echo -e "${YELLOW}🚀 Iniciando novo container...${NC}"
ssh_exec "cd ${REMOTE_DIR} && docker run -d --name ${CONTAINER_NAME} -p ${PORT}:80 --restart unless-stopped ${IMAGE_NAME}:${ENV}"

# 7. Verificar se está rodando
echo -e "${YELLOW}✅ Verificando status...${NC}"
sleep 3
ssh_exec "docker ps | grep ${CONTAINER_NAME} || echo '⚠️ Container não encontrado'"

# 8. Mostrar logs iniciais
echo -e "${YELLOW}📋 Logs iniciais:${NC}"
ssh_exec "docker logs --tail 20 ${CONTAINER_NAME}"

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}🌐 Aplicação disponível em: http://${SERVER_HOST}:${PORT}${NC}"

# Se for produção, perguntar sobre push para registry
if [ "${ENV}" = "production" ]; then
    echo -e "${YELLOW}💡 Deseja fazer push para o registry? (s/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}📤 Fazendo push para registry...${NC}"
        ssh_exec "docker tag ${IMAGE_NAME}:${ENV} localhost:5000/${IMAGE_NAME}:${ENV} && docker push localhost:5000/${IMAGE_NAME}:${ENV}"
        echo -e "${GREEN}✅ Push concluído!${NC}"
    fi
fi

# Mostrar informações de conexão
echo ""
echo -e "${BLUE}📋 Informações de Deploy:${NC}"
echo -e "   ${YELLOW}Servidor:${NC} ${SSH_USER}@${SERVER_HOST}"
echo -e "   ${YELLOW}Chave SSH:${NC} ${SSH_KEY}"
echo -e "   ${YELLOW}Container:${NC} ${CONTAINER_NAME}"
echo -e "   ${YELLOW}Imagem:${NC} ${IMAGE_NAME}:${ENV}"