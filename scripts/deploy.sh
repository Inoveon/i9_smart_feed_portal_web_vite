#!/bin/bash

# Deploy Script Unificado para i9 Smart Feed Portal
# Uso: ./deploy-unified.sh [development|homolog|production]

set -e  # Para o script se houver erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determinar ambiente
ENV="${1:-homolog}"

# Validar ambiente
if [ "$ENV" != "development" ] && [ "$ENV" != "homolog" ] && [ "$ENV" != "production" ]; then
    echo -e "${RED}❌ Ambiente inválido: $ENV${NC}"
    echo -e "${YELLOW}Uso: $0 [development|homolog|production]${NC}"
    exit 1
fi

# Configurações comuns
IMAGE_NAME="i9-campaigns"
CONTAINER_NAME="i9-campaigns-frontend"
PORT="${PORT:-3001}"

ENV_UPPER=$(echo "$ENV" | tr '[:lower:]' '[:upper:]')
echo -e "${GREEN}🚀 Deploy para ${ENV_UPPER}${NC}"

# Tratamento para desenvolvimento
if [ "$ENV" = "development" ]; then
    echo -e "${YELLOW}📦 Iniciando ambiente de desenvolvimento...${NC}"
    echo -e "${BLUE}Frontend: http://localhost:5173${NC}"
    echo -e "${BLUE}API: http://localhost:8000${NC}"
    npm run dev
    exit 0
fi

# Carregar variáveis de ambiente para homolog/production
ENV_FILE=".env.${ENV}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Arquivo $ENV_FILE não encontrado${NC}"
    echo -e "${YELLOW}Crie o arquivo com as configurações do ambiente${NC}"
    exit 1
fi

source $ENV_FILE

# Verificar variáveis obrigatórias
if [ -z "$SSH_USER" ] || [ -z "$SSH_HOST" ] || [ -z "$SSH_KEY" ] || [ -z "$REMOTE_DIR" ]; then
    echo -e "${RED}❌ Variáveis de ambiente incompletas em $ENV_FILE${NC}"
    echo -e "${YELLOW}Verifique SSH_USER, SSH_HOST, SSH_KEY e REMOTE_DIR${NC}"
    exit 1
fi

# Verificar se a chave SSH existe
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ Chave SSH não encontrada em: $SSH_KEY${NC}"
    echo -e "${BLUE}Execute: ${GREEN}make setup-ssh${NC} para configurar a autenticação SSH"
    exit 1
fi

# Função para executar comandos SSH
ssh_exec() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} "$@"
}

# Função para copiar arquivos via SCP
scp_copy() {
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r "$@" ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/
}

echo -e "${YELLOW}📍 Servidor: ${SSH_HOST}${NC}"
echo -e "${YELLOW}👤 Usuário: ${SSH_USER}${NC}"
echo -e "${YELLOW}📁 Diretório: ${REMOTE_DIR}${NC}"

# Confirmação para produção (pular se SKIP_CONFIRM=1)
if [ "$ENV" = "production" ] && [ "$SKIP_CONFIRM" != "1" ]; then
    echo ""
    echo -e "${RED}⚠️  ATENÇÃO: Deploy para PRODUÇÃO!${NC}"
    read -p "Confirma deploy para produção? (s/N): " confirm
    if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
        echo -e "${YELLOW}Deploy cancelado${NC}"
        exit 1
    fi
fi

# 1. Build local do projeto
echo -e "${YELLOW}📦 Fazendo build do projeto...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Erro: Diretório dist não foi criado${NC}"
    exit 1
fi

# 2. Criar estrutura no servidor (se não existir)
echo -e "${YELLOW}📁 Criando estrutura de diretórios no servidor...${NC}"
if [ "$ENV" = "production" ]; then
    # Para produção, precisa criar com sudo se não existir
    ssh_exec "if [ ! -d '${REMOTE_DIR}' ]; then sudo mkdir -p ${REMOTE_DIR} && sudo chown -R ${SSH_USER}:${SSH_USER} ${REMOTE_DIR}; else echo 'Diretório já existe'; fi"
else
    # Para homologação, tenta sem sudo primeiro
    ssh_exec "mkdir -p ${REMOTE_DIR} 2>/dev/null || true"
fi

# 3. Transferir arquivos
echo -e "${YELLOW}📤 Transferindo arquivos para o servidor...${NC}"

# Copiar nginx config apropriado
if [ "$ENV" = "production" ] && [ -f "nginx.production.conf" ]; then
    cp nginx.production.conf nginx.conf
else
    # Usar nginx.conf padrão para homolog
    true
fi

scp_copy dist Dockerfile nginx.conf docker-compose.yml .dockerignore

# 4. Build da imagem Docker no servidor
echo -e "${YELLOW}🐳 Fazendo build da imagem Docker...${NC}"
if [ "$ENV" = "production" ]; then
    ssh_exec "cd ${REMOTE_DIR} && sudo docker build -t ${IMAGE_NAME}:${ENV} ."
else
    ssh_exec "cd ${REMOTE_DIR} && docker build -t ${IMAGE_NAME}:${ENV} ."
fi

# 5. Parar container anterior (se existir)
echo -e "${YELLOW}🛑 Parando container anterior (se existir)...${NC}"
if [ "$ENV" = "production" ]; then
    ssh_exec "sudo docker stop ${CONTAINER_NAME} 2>/dev/null || true && sudo docker rm ${CONTAINER_NAME} 2>/dev/null || true"
else
    ssh_exec "docker stop ${CONTAINER_NAME} 2>/dev/null || true && docker rm ${CONTAINER_NAME} 2>/dev/null || true"
fi

# 6. Iniciar novo container
echo -e "${YELLOW}🚀 Iniciando novo container...${NC}"
if [ "$ENV" = "production" ]; then
    ssh_exec "cd ${REMOTE_DIR} && sudo docker run -d --name ${CONTAINER_NAME} -p ${PORT}:80 --restart unless-stopped ${IMAGE_NAME}:${ENV}"
else
    ssh_exec "cd ${REMOTE_DIR} && docker run -d --name ${CONTAINER_NAME} -p ${PORT}:80 --restart unless-stopped ${IMAGE_NAME}:${ENV}"
fi

# 7. Verificar se está rodando
echo -e "${YELLOW}✅ Verificando status...${NC}"
sleep 3
if [ "$ENV" = "production" ]; then
    ssh_exec "sudo docker ps | grep ${CONTAINER_NAME} || echo '⚠️ Container não encontrado'"
else
    ssh_exec "docker ps | grep ${CONTAINER_NAME} || echo '⚠️ Container não encontrado'"
fi

# 8. Mostrar logs iniciais
echo -e "${YELLOW}📋 Logs iniciais:${NC}"
if [ "$ENV" = "production" ]; then
    ssh_exec "sudo docker logs --tail 20 ${CONTAINER_NAME}"
else
    ssh_exec "docker logs --tail 20 ${CONTAINER_NAME}"
fi

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}🌐 Aplicação disponível em: http://${SSH_HOST}:${PORT}${NC}"

# Mostrar informações de conexão
echo ""
echo -e "${BLUE}📋 Informações de Deploy:${NC}"
echo -e "   ${YELLOW}Ambiente:${NC} ${ENV_UPPER}"
echo -e "   ${YELLOW}Servidor:${NC} ${SSH_USER}@${SSH_HOST}"
echo -e "   ${YELLOW}Container:${NC} ${CONTAINER_NAME}"
echo -e "   ${YELLOW}Imagem:${NC} ${IMAGE_NAME}:${ENV}"
echo -e "   ${YELLOW}Porta:${NC} ${PORT}"
echo -e "   ${YELLOW}Diretório:${NC} ${REMOTE_DIR}"

# Push para registry em produção (opcional)
if [ "$ENV" = "production" ]; then
    echo ""
    echo -e "${YELLOW}💡 Deseja fazer push para o registry? (s/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}📤 Fazendo push para registry...${NC}"
        ssh_exec "docker tag ${IMAGE_NAME}:${ENV} localhost:5000/${IMAGE_NAME}:${ENV} && docker push localhost:5000/${IMAGE_NAME}:${ENV}"
        echo -e "${GREEN}✅ Push concluído!${NC}"
    fi
fi