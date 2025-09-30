# Gerenciamento de Imagens

## Visão Geral

Interface dedicada para upload, organização e configuração das imagens que compõem uma campanha. Cada imagem será exibida sequencialmente nos tablets conforme a ordem definida.

## Upload de Imagens

### Métodos de Upload

#### Arrastar e Soltar
1. Selecione os arquivos no seu computador
2. Arraste para a área indicada
3. Solte para iniciar o upload
4. Aguarde o processamento

#### Seleção Manual
1. Clique no botão "Selecionar Arquivos"
2. Navegue até a pasta desejada
3. Selecione uma ou múltiplas imagens
4. Confirme a seleção

### Especificações Técnicas

#### Formatos Suportados
- **JPEG/JPG**: Ideal para fotografias e imagens com muitas cores
- **PNG**: Recomendado para imagens com transparência ou texto
- **WEBP**: Formato moderno com melhor compressão

#### Limitações
- **Tamanho máximo**: 10MB por arquivo
- **Quantidade**: Até 10 arquivos por upload
- **Total por campanha**: Máximo 20 imagens

#### Resoluções Recomendadas
- **Full HD**: 1920x1080 pixels (recomendado)
- **HD**: 1280x720 pixels (mínimo)
- **Proporção**: 16:9 (horizontal)

### Processamento

#### Etapas do Upload
1. Validação do formato
2. Verificação de tamanho
3. Upload para servidor
4. Geração de miniatura
5. Otimização automática

#### Tempo Estimado
- Imagem única: 2-5 segundos
- Múltiplas imagens: 10-30 segundos
- Depende da conexão e tamanho dos arquivos

## Organização das Imagens

### Ordem de Exibição

#### Reordenação Manual
1. Clique e segure a imagem
2. Arraste para a posição desejada
3. Solte para confirmar
4. A mudança é salva automaticamente

#### Numeração Automática
- Imagens são numeradas sequencialmente
- Número indica ordem de exibição
- Atualiza automaticamente ao reordenar

### Galeria de Imagens

#### Visualização em Grid
- Miniaturas organizadas em grade
- 3 colunas em desktop
- 2 colunas em tablet
- 1 coluna em mobile

#### Informações Exibidas
- Miniatura da imagem
- Número de ordem
- Nome do arquivo
- Tempo de exibição
- Tamanho do arquivo
- Status (ativa/inativa)

### Ações por Imagem

#### Visualizar
- Clique no ícone de olho
- Abre modal com imagem ampliada
- Mostra detalhes técnicos
- Permite download

#### Editar Propriedades
- Tempo de exibição individual
- Título alternativo
- Descrição (opcional)
- Status ativo/inativo

#### Excluir
- Clique no ícone de lixeira
- Confirme a ação
- Remoção permanente
- Reordena automaticamente

## Configurações Avançadas

### Tempo de Exibição

#### Configuração Global
Define o tempo padrão para todas as imagens:
- Mínimo: 3 segundos
- Máximo: 60 segundos
- Recomendado: 5-10 segundos

#### Configuração Individual
Personalize o tempo de cada imagem:
1. Clique na imagem
2. Ajuste o tempo
3. Salve a alteração
4. Sobrescreve o tempo global

### Transições

#### Tipos Disponíveis
- **Fade**: Transição suave (padrão)
- **Slide**: Desliza horizontalmente
- **Zoom**: Aproximação gradual
- **Nenhuma**: Mudança instantânea

#### Duração da Transição
- Rápida: 0.3 segundos
- Normal: 0.5 segundos
- Lenta: 1 segundo

### Qualidade e Otimização

#### Compressão Automática
Sistema aplica compressão inteligente:
- Mantém qualidade visual
- Reduz tamanho do arquivo
- Melhora tempo de carregamento

#### Redimensionamento
Imagens muito grandes são ajustadas:
- Mantém proporção original
- Otimiza para resolução do tablet
- Preserva qualidade

## Validações e Regras

### Antes do Upload

#### Verificações Locais
- Formato do arquivo
- Tamanho em MB
- Quantidade de arquivos
- Nomes duplicados

#### Preparação Recomendada
1. Otimize imagens antes do upload
2. Use nomes descritivos
3. Mantenha proporção 16:9
4. Comprima se necessário

### Durante o Upload

#### Indicadores de Progresso
- Barra de progresso individual
- Percentual de conclusão
- Tempo estimado restante
- Status de cada arquivo

#### Tratamento de Erros
- Arquivo muito grande: Reduza o tamanho
- Formato inválido: Converta para JPG/PNG
- Upload interrompido: Tente novamente
- Limite excedido: Remova outras imagens

### Após o Upload

#### Verificação de Integridade
- Imagem carregou corretamente
- Miniatura foi gerada
- Ordem está correta
- Metadados salvos

## Boas Práticas

### Design das Imagens

#### Legibilidade
- Texto grande e claro
- Contraste adequado
- Evite fontes decorativas
- Teste em diferentes distâncias

#### Composição
- Foco no elemento principal
- Evite poluição visual
- Use espaço negativo
- Mantenha consistência visual

#### Cores
- Use paleta da marca
- Evite cores muito vibrantes
- Considere iluminação ambiente
- Teste em diferentes brilhos

### Otimização de Performance

#### Tamanho de Arquivo
- JPEG: 200-500KB ideal
- PNG: 300-800KB para texto
- Evite arquivos > 2MB
- Use ferramentas de compressão

#### Quantidade de Imagens
- 3-5 imagens: Rotação ideal
- 6-10 imagens: Campanhas especiais
- >10 imagens: Evite, pode cansar

#### Tempo Total do Ciclo
- 30-60 segundos: Ideal
- Permite visualização completa
- Evita repetição excessiva
- Mantém atenção

## Acessibilidade

### Textos Alternativos
Importante para:
- Relatórios de analytics
- Busca interna
- Logs do sistema
- Conformidade

### Como Adicionar
1. Selecione a imagem
2. Clique em "Editar"
3. Preencha campo "Descrição"
4. Seja descritivo e conciso

## Monitoramento

### Métricas por Imagem
- Número de exibições
- Tempo médio visualizado
- Taxa de skip (se aplicável)
- Horários de pico

### Relatórios
- Performance individual
- Comparativo entre imagens
- Evolução temporal
- Análise por região

## Integração com CDN

### Benefícios
- Carregamento mais rápido
- Menor uso de banda
- Cache otimizado
- Disponibilidade garantida

### Como Funciona
1. Upload para servidor principal
2. Distribuição para CDN
3. Tablets baixam do servidor mais próximo
4. Cache local no tablet

## Solução de Problemas

### Imagem Não Aparece

#### Verificações
1. Upload concluído com sucesso?
2. Formato suportado?
3. Campanha está ativa?
4. Imagem está ativa?

#### Soluções
- Faça upload novamente
- Limpe cache do navegador
- Verifique logs de erro
- Contate suporte

### Upload Lento

#### Causas Comuns
- Arquivo muito grande
- Conexão lenta
- Muitos uploads simultâneos
- Servidor sobrecarregado

#### Soluções
- Comprima as imagens
- Upload uma por vez
- Tente em horário alternativo
- Use conexão mais rápida

### Ordem Não Salva

#### Procedimento
1. Aguarde indicação de salvamento
2. Não faça mudanças muito rápidas
3. Recarregue a página
4. Tente novamente

### Qualidade Ruim

#### Verificações
1. Qualidade original da imagem
2. Compressão excessiva
3. Resolução inadequada
4. Formato incorreto

#### Melhorias
- Use imagens de alta qualidade
- Evite múltiplas compressões
- Mantenha resolução mínima HD
- Prefira JPEG para fotos

## Dicas Avançadas

### Batch Processing
Para muitas imagens:
1. Prepare todas localmente
2. Nomeie sequencialmente
3. Comprima em lote
4. Upload de uma vez

### Templates
Crie templates para:
- Manter consistência
- Acelerar produção
- Padronizar layouts
- Facilitar atualizações

### Versionamento
Mantenha controle de versões:
- Use datas no nome
- Arquive versões antigas
- Documente mudanças
- Facilite rollback