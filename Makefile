# i9 Smart Campaigns Portal - Makefile
# Automação de comandos do projeto

# Cores para output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Comandos padrão
.PHONY: help
help: ## Mostra este menu de ajuda
	@echo "$(GREEN)i9 Smart Campaigns Portal - Comandos disponíveis:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ==================== DESENVOLVIMENTO ====================

.PHONY: dev
dev: ## Inicia servidor de desenvolvimento com hot reload (porta 5173)
	@echo "$(YELLOW)🚀 Iniciando servidor de desenvolvimento...$(NC)"
	@npm run dev -- --host 0.0.0.0

.PHONY: dev-host
dev-host: ## Inicia servidor de desenvolvimento acessível na rede local
	@echo "$(YELLOW)🚀 Iniciando servidor de desenvolvimento (rede local)...$(NC)"
	@npm run dev -- --host

.PHONY: dev-port
dev-port: ## Inicia servidor em porta customizada (usar: make dev-port PORT=3000)
	@echo "$(YELLOW)🚀 Iniciando servidor na porta $(PORT)...$(NC)"
	@npm run dev -- --port $(PORT)

# ==================== INSTALAÇÃO ====================

.PHONY: install
install: ## Instala todas as dependências
	@echo "$(YELLOW)📦 Instalando dependências...$(NC)"
	@npm install
	@echo "$(GREEN)✅ Dependências instaladas!$(NC)"

.PHONY: install-clean
install-clean: clean install ## Limpa e reinstala dependências

.PHONY: update
update: ## Atualiza dependências para versões mais recentes
	@echo "$(YELLOW)📦 Atualizando dependências...$(NC)"
	@npm update
	@echo "$(GREEN)✅ Dependências atualizadas!$(NC)"

# ==================== HOMOLOGAÇÃO ====================

.PHONY: homolog-build
homolog-build: ## Build otimizado para homologação (Gateway Inoveon)
	@echo "$(YELLOW)🚀 Build para Homologação (Gateway)...$(NC)"
	@echo "$(BLUE)Usando paths relativos para API...$(NC)"
	@VITE_API_URL= npm run build
	@echo "$(GREEN)✅ Build para homologação pronto em ./dist$(NC)"

.PHONY: homolog-serve
homolog-serve: homolog-build ## Serve build de homologação na porta 3000
	@echo "$(YELLOW)🚀 Servindo build de homologação...$(NC)"
	@echo "$(BLUE)Frontend: http://10.0.10.116:3000$(NC)"
	@echo "$(BLUE)Gateway: https://main.inoveon.com.br/campanhas/$(NC)"
	@npx serve dist -p 3000 -s --no-clipboard

.PHONY: homolog-test
homolog-test: ## Testa conectividade com API via paths relativos
	@echo "$(YELLOW)🧪 Testando API com paths relativos...$(NC)"
	@curl -s http://localhost:3000/api/health || echo "$(RED)❌ API não acessível localmente$(NC)"
	@echo "$(BLUE)Teste via Gateway: https://main.inoveon.com.br/api/health$(NC)"

# ==================== BUILD ====================

.PHONY: build
build: ## Compila projeto para produção
	@echo "$(YELLOW)🔨 Compilando projeto...$(NC)"
	@npm run build
	@echo "$(GREEN)✅ Build concluído! Arquivos em ./dist$(NC)"

.PHONY: preview
preview: ## Visualiza build de produção localmente
	@echo "$(YELLOW)👀 Iniciando preview da build...$(NC)"
	@npm run preview

.PHONY: serve
serve: build ## Compila e serve em produção (porta 3000)
	@echo "$(YELLOW)🚀 Servindo build de produção na porta 3000...$(NC)"
	@npx serve dist -p 3000 --no-clipboard

.PHONY: serve-custom
serve-custom: build ## Compila e serve em porta customizada (usar: make serve-custom PORT=8080)
	@echo "$(YELLOW)🚀 Servindo build de produção na porta $(PORT)...$(NC)"
	@npx serve dist -p $(PORT) --no-clipboard

.PHONY: build-analyze
build-analyze: ## Compila e analisa tamanho do bundle
	@echo "$(YELLOW)📊 Analisando bundle...$(NC)"
	@npm run build
	@echo ""
	@echo "$(BLUE)Tamanho dos arquivos:$(NC)"
	@du -sh dist/
	@echo ""
	@echo "$(BLUE)Detalhamento:$(NC)"
	@ls -lh dist/assets/

# ==================== QUALIDADE ====================

.PHONY: lint
lint: ## Executa linter (ESLint)
	@echo "$(YELLOW)🔍 Verificando código com ESLint...$(NC)"
	@npm run lint

.PHONY: lint-fix
lint-fix: ## Corrige problemas de lint automaticamente
	@echo "$(YELLOW)🔧 Corrigindo problemas de lint...$(NC)"
	@npx eslint . --ext ts,tsx --fix
	@echo "$(GREEN)✅ Problemas corrigidos!$(NC)"

.PHONY: type-check
type-check: ## Verifica tipos TypeScript
	@echo "$(YELLOW)🔍 Verificando tipos TypeScript...$(NC)"
	@npm run type-check
	@echo "$(GREEN)✅ Tipos verificados!$(NC)"

.PHONY: check
check: type-check lint ## Executa todas as verificações

.PHONY: format
format: ## Formata código com Prettier
	@echo "$(YELLOW)🎨 Formatando código...$(NC)"
	@npx prettier --write "src/**/*.{ts,tsx,css}"
	@echo "$(GREEN)✅ Código formatado!$(NC)"

# ==================== COMPONENTES ====================

.PHONY: add-component
add-component: ## Adiciona componente Shadcn/UI (usar: make add-component COMP=button)
	@echo "$(YELLOW)➕ Adicionando componente $(COMP)...$(NC)"
	@npx shadcn-ui@latest add $(COMP)
	@echo "$(GREEN)✅ Componente $(COMP) adicionado!$(NC)"

.PHONY: list-components
list-components: ## Lista componentes disponíveis do Shadcn/UI
	@echo "$(BLUE)📦 Componentes Shadcn/UI disponíveis:$(NC)"
	@echo ""
	@echo "  accordion, alert, alert-dialog, aspect-ratio, avatar,"
	@echo "  badge, button, calendar, card, carousel, checkbox,"
	@echo "  collapsible, command, context-menu, data-table, date-picker,"
	@echo "  dialog, drawer, dropdown-menu, form, hover-card, input,"
	@echo "  label, menubar, navigation-menu, pagination, popover,"
	@echo "  progress, radio-group, scroll-area, select, separator,"
	@echo "  sheet, skeleton, slider, sonner, switch, table, tabs,"
	@echo "  textarea, toast, toggle, toggle-group, tooltip"
	@echo ""
	@echo "$(YELLOW)Uso: make add-component COMP=nome$(NC)"

# ==================== SEGURANÇA ====================

.PHONY: audit
audit: ## Verifica vulnerabilidades de segurança
	@echo "$(YELLOW)🔒 Verificando vulnerabilidades...$(NC)"
	@npm audit

.PHONY: audit-fix
audit-fix: ## Corrige vulnerabilidades automaticamente (sem breaking changes)
	@echo "$(YELLOW)🔧 Corrigindo vulnerabilidades...$(NC)"
	@npm audit fix
	@echo "$(GREEN)✅ Vulnerabilidades corrigidas!$(NC)"

# ==================== LIMPEZA ====================

.PHONY: clean
clean: ## Limpa arquivos de build e cache
	@echo "$(YELLOW)🧹 Limpando arquivos temporários...$(NC)"
	@rm -rf dist/
	@rm -rf node_modules/.vite/
	@rm -rf .eslintcache
	@echo "$(GREEN)✅ Limpeza concluída!$(NC)"

.PHONY: clean-all
clean-all: clean ## Limpa tudo incluindo node_modules
	@echo "$(YELLOW)🧹 Removendo node_modules...$(NC)"
	@rm -rf node_modules/
	@echo "$(GREEN)✅ Limpeza completa!$(NC)"

# ==================== GIT ====================

.PHONY: status
status: ## Mostra status do git
	@echo "$(BLUE)📊 Status do repositório:$(NC)"
	@git status

.PHONY: commit
commit: check ## Verifica código e faz commit (usar: make commit MSG="mensagem")
	@echo "$(YELLOW)📝 Criando commit...$(NC)"
	@git add .
	@git commit -m "$(MSG)"
	@echo "$(GREEN)✅ Commit criado!$(NC)"

# ==================== DOCKER ====================

.PHONY: docker-build
docker-build: ## Constrói imagem Docker
	@echo "$(YELLOW)🐳 Construindo imagem Docker...$(NC)"
	@docker build -t i9-campaigns-portal .
	@echo "$(GREEN)✅ Imagem criada!$(NC)"

.PHONY: docker-run
docker-run: ## Executa container Docker
	@echo "$(YELLOW)🐳 Iniciando container...$(NC)"
	@docker run -p 3000:3000 i9-campaigns-portal

# ==================== DEPLOY ====================

.PHONY: deploy-all-info
deploy-all-info: ## Mostra informações de todos os ambientes de deploy
	@echo "$(GREEN)🌍 AMBIENTES DISPONÍVEIS$(NC)"
	@echo ""
	@echo "$(BLUE)📋 Comandos de Deploy:$(NC)"
	@echo "   $(YELLOW)Desenvolvimento:$(NC) make deploy-development"
	@echo "   $(YELLOW)Homologação:$(NC)    make deploy-homolog"
	@echo "   $(YELLOW)Produção:$(NC)       make deploy-production"
	@echo ""
	@echo "$(BLUE)📊 Comandos de Status:$(NC)"
	@echo "   $(YELLOW)Desenvolvimento:$(NC) make development-status"
	@echo "   $(YELLOW)Homologação:$(NC)    make homolog-status"
	@echo "   $(YELLOW)Produção:$(NC)       make production-status"
	@echo ""
	@echo "$(BLUE)📝 Ver configurações:$(NC) make deploy-info"

.PHONY: setup-ssh
setup-ssh: ## Configura chave SSH para todos os ambientes
	@echo "$(GREEN)🔐 Configurando chave SSH para todos os ambientes...$(NC)"
	@bash scripts/setup-ssh.sh all

.PHONY: setup-ssh-homolog
setup-ssh-homolog: ## Configura chave SSH apenas para homologação
	@echo "$(GREEN)🔐 Configurando chave SSH para homologação...$(NC)"
	@bash scripts/setup-ssh.sh homolog

.PHONY: setup-ssh-production
setup-ssh-production: ## Configura chave SSH apenas para produção
	@echo "$(GREEN)🔐 Configurando chave SSH para produção...$(NC)"
	@bash scripts/setup-ssh.sh production

.PHONY: deploy-development
deploy-development: ## Inicia servidor de desenvolvimento local
	@bash scripts/deploy.sh development

.PHONY: development-status
development-status: ## Verifica status do desenvolvimento local
	@echo "$(BLUE)📊 Status do Desenvolvimento:$(NC)"
	@echo "$(YELLOW)Verificando portas...$(NC)"
	@lsof -i :5173 > /dev/null 2>&1 && echo "   ✅ Frontend rodando na porta 5173" || echo "   ❌ Frontend não está rodando"
	@lsof -i :8000 > /dev/null 2>&1 && echo "   ✅ API rodando na porta 8000" || echo "   ❌ API não está rodando"

.PHONY: development-stop
development-stop: ## Para o servidor de desenvolvimento
	@echo "$(YELLOW)🛑 Parando servidor de desenvolvimento...$(NC)"
	@pkill -f "vite" || echo "Servidor já estava parado"
	@echo "$(GREEN)✅ Servidor de desenvolvimento parado$(NC)"

.PHONY: development-restart
development-restart: development-stop deploy-development ## Reinicia o servidor de desenvolvimento

.PHONY: deploy-homolog
deploy-homolog: ## Deploy para servidor de homologação
	@bash scripts/deploy.sh homolog

.PHONY: deploy-production
deploy-production: ## Deploy para servidor de produção (172.16.2.90)
	@bash scripts/deploy.sh production

.PHONY: deploy-production-quick
deploy-production-quick: ## Deploy para produção sem confirmação
	@echo "$(GREEN)🚀 Deploy direto para produção...$(NC)"
	@SKIP_CONFIRM=1 bash scripts/deploy.sh production

.PHONY: homolog-status
homolog-status: ## Verifica status do deploy em homologação
	@if [ -f .env.homolog ]; then \
		source .env.homolog; \
		echo "$(BLUE)📊 Status da Homologação:$(NC)"; \
		ssh -i $$SSH_KEY $$SSH_USER@$$SSH_HOST "docker ps | grep i9-campaigns || echo 'Container não está rodando'"; \
	else \
		echo "$(YELLOW)⚠️  Arquivo .env.homolog não encontrado$(NC)"; \
	fi

.PHONY: homolog-logs
homolog-logs: ## Mostra logs do container em homologação
	@if [ -f .env.homolog ]; then \
		source .env.homolog; \
		echo "$(BLUE)📋 Logs da Homologação:$(NC)"; \
		ssh -i $$SSH_KEY $$SSH_USER@$$SSH_HOST "docker logs --tail 50 i9-campaigns-frontend"; \
	else \
		echo "$(YELLOW)⚠️  Arquivo .env.homolog não encontrado$(NC)"; \
	fi

.PHONY: homolog-restart
homolog-restart: ## Reinicia o container em homologação
	@if [ -f .env.homolog ]; then \
		source .env.homolog; \
		echo "$(YELLOW)🔄 Reiniciando container em homologação...$(NC)"; \
		ssh -i $$SSH_KEY $$SSH_USER@$$SSH_HOST "docker restart i9-campaigns-frontend"; \
		echo "$(GREEN)✅ Container reiniciado!$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Arquivo .env.homolog não encontrado$(NC)"; \
	fi

.PHONY: deploy-info
deploy-info: ## Mostra informações de todos os ambientes
	@echo "$(BLUE)📋 Configurações de Deploy:$(NC)"; \
	echo ""; \
	if [ -f .env.homolog ]; then \
		source .env.homolog; \
		echo "$(YELLOW)HOMOLOGAÇÃO:$(NC)"; \
		echo "   Servidor: $$SSH_HOST"; \
		echo "   Usuário: $$SSH_USER"; \
		echo "   Diretório: $$REMOTE_DIR"; \
		echo ""; \
	fi; \
	if [ -f .env.production ]; then \
		source .env.production; \
		echo "$(YELLOW)PRODUÇÃO:$(NC)"; \
		echo "   Servidor: $$SSH_HOST"; \
		echo "   Usuário: $$SSH_USER"; \
		echo "   Diretório: $$REMOTE_DIR"; \
	fi

.PHONY: production-status
production-status: ## Verifica status do deploy em produção
	@echo "$(BLUE)📊 Status da Produção (172.16.2.90):$(NC)"
	@sshpass -p 'aldo$$2024' ssh -o StrictHostKeyChecking=no i9on@172.16.2.90 \
		"sudo docker ps | grep feed-portal || echo '⚠️ Container não está rodando'"

.PHONY: production-logs
production-logs: ## Mostra logs do container em produção
	@echo "$(BLUE)📋 Logs da Produção:$(NC)"
	@sshpass -p 'aldo$$2024' ssh -o StrictHostKeyChecking=no i9on@172.16.2.90 \
		"sudo docker logs --tail 50 i9-feed-portal-frontend"

.PHONY: production-restart
production-restart: ## Reinicia o container em produção
	@echo "$(YELLOW)🔄 Reiniciando container em produção...$(NC)"
	@sshpass -p 'aldo$$2024' ssh -o StrictHostKeyChecking=no i9on@172.16.2.90 \
		"sudo docker restart i9-feed-portal-frontend"
	@echo "$(GREEN)✅ Container reiniciado!$(NC)"

# ==================== UTILIDADES ====================

.PHONY: tree
tree: ## Mostra estrutura de diretórios do projeto
	@echo "$(BLUE)📁 Estrutura do projeto:$(NC)"
	@tree -I 'node_modules|dist|.git' -L 3

.PHONY: stats
stats: ## Mostra estatísticas do projeto
	@echo "$(BLUE)📊 Estatísticas do projeto:$(NC)"
	@echo ""
	@echo "$(YELLOW)Arquivos TypeScript/React:$(NC)"
	@find src -name "*.tsx" -o -name "*.ts" | wc -l
	@echo ""
	@echo "$(YELLOW)Componentes:$(NC)"
	@ls -1 src/components/ui/ 2>/dev/null | wc -l
	@echo ""
	@echo "$(YELLOW)Páginas:$(NC)"
	@ls -1 src/pages/ 2>/dev/null | wc -l
	@echo ""
	@echo "$(YELLOW)Linhas de código:$(NC)"
	@find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | tail -1

.PHONY: open
open: ## Abre o projeto no navegador
	@echo "$(YELLOW)🌐 Abrindo navegador...$(NC)"
	@open http://localhost:5173

# ==================== DESENVOLVIMENTO RÁPIDO ====================

.PHONY: dev-full
dev-full: ## Executa dev + abre navegador
	@echo "$(GREEN)🚀 Iniciando desenvolvimento completo...$(NC)"
	@npm run dev -- --host 0.0.0.0 &
	@sleep 2
	@make open

.PHONY: reset
reset: clean-all install dev ## Reset completo: limpa, instala e inicia dev

.PHONY: quick-start
quick-start: ## Início rápido para novos desenvolvedores
	@echo "$(GREEN)🎯 Configuração rápida do projeto...$(NC)"
	@echo ""
	@echo "$(YELLOW)1. Instalando dependências...$(NC)"
	@npm install
	@echo ""
	@echo "$(YELLOW)2. Verificando tipos...$(NC)"
	@npm run type-check
	@echo ""
	@echo "$(YELLOW)3. Iniciando servidor...$(NC)"
	@npm run dev

# Configuração padrão
.DEFAULT_GOAL := help