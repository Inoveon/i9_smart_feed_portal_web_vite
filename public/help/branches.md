# Filiais

## Visão Geral

Módulo de gerenciamento e visualização das filiais cadastradas no sistema. As filiais são unidades organizacionais que agrupam estações e permitem segmentação regional de campanhas.

## Estrutura Organizacional

### Hierarquia
```
Empresa
└── Região
    └── Filial
        └── Estação (Tablet)
```

### Informações da Filial

#### Dados Principais
- **Código**: Identificador único da filial
- **Nome**: Razão social ou nome fantasia
- **CNPJ**: Documento de identificação fiscal
- **Status**: Ativa, Inativa, Em manutenção

#### Localização
- **Endereço**: Logradouro completo
- **Cidade**: Município
- **Estado**: Unidade federativa
- **CEP**: Código postal
- **Região**: Agrupamento geográfico

#### Contato
- **Telefone**: Principal e alternativo
- **E-mail**: Contato administrativo
- **Responsável**: Gerente ou supervisor
- **Horário**: Funcionamento da unidade

## Funcionalidades

### Listagem de Filiais

#### Visualização em Tabela
- Código e nome
- Cidade/Estado
- Região
- Quantidade de estações
- Status operacional
- Ações disponíveis

#### Visualização em Cards
- Layout mais visual
- Informações resumidas
- Indicadores de performance
- Acesso rápido às ações

### Filtros e Busca

#### Busca Textual
- Por nome da filial
- Por código
- Por cidade
- Por responsável

#### Filtros Disponíveis
- **Região**: Norte, Sul, Leste, Oeste, Centro
- **Estado**: Todas as UFs
- **Status**: Ativa, Inativa, Manutenção
- **Estações**: Com/Sem estações ativas

### Detalhes da Filial

#### Informações Exibidas
- Todos os dados cadastrais
- Histórico de alterações
- Estações vinculadas
- Campanhas ativas
- Métricas de desempenho

#### Ações Disponíveis
- Editar informações
- Ativar/Desativar
- Gerenciar estações
- Ver relatórios
- Exportar dados

## Gestão de Estações

### Estações por Filial
Lista todas as estações (tablets) vinculadas à filial selecionada.

#### Informações da Estação
- Código identificador
- Modelo do dispositivo
- Status de conexão
- Última atualização
- Campanha em exibição

#### Status Possíveis
- **Online**: Conectada e operacional
- **Offline**: Sem conexão
- **Manutenção**: Em reparo ou atualização
- **Inativa**: Desativada temporariamente

### Adicionar Estação
1. Selecione a filial
2. Clique em "Nova Estação"
3. Informe o código do tablet
4. Configure parâmetros
5. Ative a estação

### Transferir Estação
Mova estações entre filiais:
1. Selecione as estações
2. Escolha a filial destino
3. Confirme a transferência
4. Atualize campanhas se necessário

## Campanhas por Filial

### Visualização
Veja todas as campanhas ativas em uma filial específica.

### Segmentação
Configure campanhas para:
- Filial específica
- Grupo de filiais
- Todas exceto algumas
- Por características

## Métricas e Indicadores

### KPIs Principais
- **Taxa de Disponibilidade**: Percentual de tempo online
- **Visualizações**: Total de impressões de campanhas
- **Engajamento**: Interações registradas
- **Performance**: Comparativo com outras filiais

### Relatórios Disponíveis
- Resumo executivo
- Análise comparativa
- Evolução temporal
- Ranking de filiais

### Exportação de Dados
Formatos suportados:
- Excel (.xlsx)
- CSV (.csv)
- PDF (relatório formatado)
- JSON (integração sistemas)

## Sincronização

### Integração com ERP
O sistema sincroniza automaticamente com o ERP principal:
- Frequência: A cada 6 horas
- Dados atualizados: Informações cadastrais
- Conflitos: Resolvidos manualmente

### Atualização Manual
1. Acesse a filial desejada
2. Clique em "Sincronizar"
3. Aguarde o processamento
4. Verifique alterações

## Configurações Regionais

### Fuso Horário
Cada filial pode ter seu fuso horário configurado:
- Afeta agendamento de campanhas
- Importante para relatórios
- Ajusta horários de exibição

### Idioma e Localização
Configure para filiais internacionais:
- Idioma da interface
- Formato de data/hora
- Moeda para relatórios

## Permissões

### Níveis de Acesso

#### Visualização
- Ver lista de filiais
- Acessar informações básicas
- Consultar estações

#### Edição Regional
- Editar filiais da sua região
- Gerenciar estações regionais
- Criar campanhas regionais

#### Administração Total
- Todas as operações
- Criar/excluir filiais
- Configurações globais

### Auditoria
Todas as ações são registradas:
- Usuário responsável
- Data e hora
- Tipo de alteração
- Valores anteriores

## Manutenção

### Status de Manutenção
Quando uma filial está em manutenção:
- Estações continuam operando
- Novas campanhas não são aplicadas
- Alertas são enviados
- Relatórios indicam o status

### Procedimento
1. Notifique usuários afetados
2. Defina período de manutenção
3. Execute alterações necessárias
4. Teste funcionamento
5. Reative filial

## Integração com Outros Módulos

### Campanhas
- Segmentação por filial
- Priorização regional
- Conteúdo localizado

### Analytics
- Métricas por filial
- Comparativos regionais
- Tendências locais

### Atividades
- Log de ações por filial
- Histórico de mudanças
- Auditoria regional

## Boas Práticas

### Nomenclatura
- Use padrão consistente
- Inclua cidade no nome
- Evite abreviações confusas

### Organização
- Agrupe por região lógica
- Mantenha dados atualizados
- Revise status periodicamente

### Performance
- Limite filtros simultâneos
- Use paginação em listas grandes
- Cache dados frequentes

## Solução de Problemas

### Filial Não Aparece
1. Verifique filtros ativos
2. Confirme sincronização
3. Valide permissões
4. Atualize página

### Dados Desatualizados
1. Force sincronização
2. Limpe cache do navegador
3. Verifique conexão ERP
4. Contate administrador

### Estações Offline
1. Verifique conexão internet local
2. Reinicie dispositivos
3. Valide configurações de rede
4. Acione suporte técnico

### Erro ao Editar
1. Confirme suas permissões
2. Verifique campos obrigatórios
3. Valide formato dos dados
4. Tente em outro navegador