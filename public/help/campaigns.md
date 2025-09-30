# Campanhas

## Visão Geral

Gerencie campanhas de marketing digital que serão exibidas nos tablets das estações. As campanhas são o principal meio de comunicação visual com os clientes.

## Interface Principal

### Barra de Ferramentas
Localizada no topo da página, oferece acesso rápido às principais funcionalidades.

### Lista de Campanhas
Tabela com todas as campanhas cadastradas, ordenadas por data de criação.

### Paginação
Navegue entre páginas quando houver muitas campanhas cadastradas.

## Funcionalidades Detalhadas

### Criar Nova Campanha

#### Campos Obrigatórios
- **Nome**: Identificador único da campanha (máximo 100 caracteres)
- **Data de Início**: Quando a campanha começará a ser exibida
- **Data de Fim**: Quando a campanha será automaticamente desativada
- **Tempo de Exibição**: Duração em segundos de cada imagem

#### Campos Opcionais
- **Descrição**: Detalhes adicionais sobre a campanha
- **Prioridade**: Valor de 0 a 100 (maior valor = maior prioridade)
- **Tags**: Palavras-chave para facilitar a busca

#### Segmentação
Defina onde a campanha será exibida:

1. **Global**: Todas as estações
2. **Por Região**: Selecione uma ou mais regiões
3. **Por Filial**: Escolha filiais específicas
4. **Por Estação**: Controle individual por tablet

### Editar Campanha

#### Informações Editáveis
- Todos os campos da criação
- Status da campanha
- Segmentação

#### Informações Não Editáveis
- ID da campanha
- Data de criação
- Histórico de modificações

#### Validações
- Não é possível definir data de fim anterior à data de início
- Campanhas ativas não podem ter datas passadas
- Pelo menos uma estação deve estar selecionada

### Gerenciar Imagens

#### Upload de Imagens
- **Formatos aceitos**: JPG, PNG, WEBP
- **Tamanho máximo**: 10MB por arquivo
- **Resolução recomendada**: 1920x1080 pixels
- **Limite**: 20 imagens por campanha

#### Organização
- Arraste para reordenar
- Clique para visualizar em tamanho real
- Configure tempo individual por imagem

#### Otimização
- Comprima imagens antes do upload
- Use JPEG para fotos
- Use PNG para imagens com texto
- Mantenha proporção 16:9

### Duplicar Campanha
Crie uma nova campanha baseada em uma existente:
1. Selecione a campanha origem
2. Clique em "Duplicar"
3. Ajuste nome e datas
4. Salve a nova campanha

### Excluir Campanha

#### Exclusão Lógica (Recomendado)
- Campanha fica inativa mas mantém histórico
- Pode ser reativada posteriormente
- Preserva dados para relatórios

#### Exclusão Física
- Remove permanentemente do sistema
- Não pode ser recuperada
- Requer permissão de administrador

## Status das Campanhas

### Ativa
- Em exibição atual nos tablets
- Dentro do período de vigência
- Com imagens cadastradas

### Agendada
- Data de início no futuro
- Configuração completa
- Aguardando ativação automática

### Pausada
- Temporariamente suspensa
- Mantém configurações
- Pode ser reativada manualmente

### Expirada
- Passou da data final
- Não é mais exibida
- Mantida para histórico

### Rascunho
- Criação incompleta
- Não pode ser ativada
- Requer finalização

## Filtros e Busca

### Busca Textual
- Por nome da campanha
- Por descrição
- Por tags

### Filtros Disponíveis
- **Status**: Ativa, Pausada, Agendada, Expirada
- **Região**: Norte, Sul, Leste, Oeste, Centro
- **Período**: Últimos 7, 30, 90 dias
- **Prioridade**: Alta, Média, Baixa

### Ordenação
- Nome (A-Z, Z-A)
- Data de criação
- Data de início
- Prioridade
- Status

## Métricas e Analytics

### Visualizações
Total de vezes que as imagens da campanha foram exibidas.

### Alcance
Número de estações diferentes que exibiram a campanha.

### Engagement
Taxa de interação quando disponível (toques na tela).

### Tempo Médio
Duração média de visualização por sessão.

## Agendamento Inteligente

### Horários de Pico
Configure campanhas para exibir apenas em horários específicos:
- Manhã: 6h às 12h
- Tarde: 12h às 18h
- Noite: 18h às 23h

### Dias da Semana
Selecione dias específicos para exibição:
- Dias úteis
- Finais de semana
- Dias específicos

### Sazonalidade
Planeje campanhas com antecedência:
- Datas comemorativas
- Eventos especiais
- Períodos promocionais

## Boas Práticas

### Nomenclatura
- Use nomes descritivos e únicos
- Inclua data ou período no nome
- Evite caracteres especiais

### Conteúdo Visual
- Mantenha mensagem clara e direta
- Use cores contrastantes
- Fonte legível à distância
- Evite excesso de texto

### Timing
- 5-10 segundos por imagem
- Máximo 5 imagens por campanha para rotação eficiente
- Considere o contexto de visualização

### Segmentação
- Campanhas regionais para ofertas locais
- Campanhas globais para comunicados gerais
- Teste em grupo pequeno antes de expandir

## Integração com Outros Módulos

### Filiais
Campanhas podem ser direcionadas para filiais específicas baseadas em:
- Localização geográfica
- Perfil de clientes
- Volume de vendas

### Estações
Monitore em tempo real onde cada campanha está sendo exibida.

### Relatórios
Exporte dados de campanhas para análise detalhada.

## Permissões e Controle de Acesso

### Visualização
Todos os usuários podem ver campanhas ativas.

### Criação
Requer permissão de Editor ou superior.

### Edição
- Editor: Suas próprias campanhas
- Gerente: Campanhas da sua região
- Administrador: Todas as campanhas

### Exclusão
Apenas Administradores podem excluir permanentemente.

## Solução de Problemas

### Campanha não aparece nos tablets
1. Verifique se está ativa
2. Confirme período de vigência
3. Valide segmentação
4. Verifique se há imagens

### Upload de imagem falha
1. Confirme formato do arquivo
2. Verifique tamanho (< 10MB)
3. Tente um arquivo por vez
4. Limpe cache do navegador

### Erro ao salvar campanha
1. Verifique campos obrigatórios
2. Confirme datas válidas
3. Verifique conexão internet
4. Tente novamente em alguns segundos

### Performance lenta
1. Reduza número de imagens
2. Otimize tamanho dos arquivos
3. Limite filtros ativos
4. Atualize navegador