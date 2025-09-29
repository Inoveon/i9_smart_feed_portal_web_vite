# Solicitação à API — Validações e Ajustes (Branches, Stations, Targeting)

## Resumo
Este documento consolida o que precisa ser validado/ajustado na API para suportar plenamente o frontend de Filiais, Estações e o Targeting hierárquico de Campanhas (Global, Regiões, Filiais e Estações específicas).

## 1) Correções Identificadas
- `/api/campaigns/` → retorna 500 em ambiente local (listagem)
- `/api/campaigns/{id}` → retorna 500 (detalhe)
- `/api/branches/active` → retorna 500

Aceite: estas rotas devem responder 200/404 com JSON válido e schema estável.

## 2) Consistência de Targeting em Ativas por Estação
- Regra desejada para `/api/campaigns/active/{station_id}` (igual ao endpoint dos tablets):
  - Incluir campanhas globais (arrays vazias)
  - Incluir campanhas por Regiões quando a estação pertencer a qualquer região da campanha
  - Incluir campanhas por Filiais quando a estação pertencer a qualquer filial da campanha
  - Incluir campanhas por Estações quando a estação estiver explicitamente selecionada

Aceite: `/api/campaigns/active/{station_id}` e `/api/tablets/active/{station_id}` devolvem conjuntos consistentes segundo a hierarquia acima.

## 3) Contratos de Campaign (congelar)
- Response (list e get):
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string?",
    "status": "active|scheduled|paused|expired",
    "start_date": "ISO",
    "end_date": "ISO",
    "default_display_time": 5000,
    "priority": 0,
    "is_deleted": false,
    "created_at": "ISO",
    "updated_at": "ISO",
    "regions": ["Sudeste", "Sul"],
    "branches": ["010101", "020201"],
    "stations": ["station-uuid-1", "station-uuid-2"]
  }
  ```
- Create/Update (body): aceitar os três arrays acima; arrays vazias = campanha global.

## 4) Identificação de Estação
- Recomendado: `stations` conter IDs (UUIDs) das estações para unicidade global.
- Alternativa: aceitar pares `{ branch_code, station_code }` se a identificação por código for necessária.
- Evitar somente `station_code` sem namespacing, pois pode haver repetição entre filiais.

## 5) `/api/stations/available` (estrutura)
- Padrão observado adequado para UI:
  ```json
  {
    "regions": {
      "Sudeste": [ { "code": "010101", "name": "Filial São Paulo 01", "state": "SP" }, ... ]
    },
    "branches": {
      "010101": {
        "name": "Filial São Paulo 01",
        "state": "SP",
        "region": "Sudeste",
        "stations": [ { "code": "001", "name": "Posto Central" }, ... ]
      }
    }
  }
  ```
- Aceite: manter estável; todas filiais/estações cadastradas devem constar corretamente.

## 6) Filtros e Paginação
- Branches (`/api/branches`):
  - Query params sugeridos: `region`, `state`, `is_active`, `search`, `page`, `limit`
- Stations (`/api/stations`):
  - Query params sugeridos: `branch_id` ou `branch_code`, `state`, `is_active`, `search`, `page`, `limit`
- Aceite: filtros aplicados e respostas consistentes; se houver paginação, incluir metadados.

## 7) Exemplos Mínimos de Respostas (OK)
- Campaign list/get com `regions/branches/stations` sempre presentes (arrays, possivelmente vazios)
- `/api/campaigns/active/{station_id}` incluindo globais e específicas de acordo com a hierarquia
- `/api/branches/active` respondendo 200 com lista de filiais ativas

## 8) Critérios de Aceite
- Nenhum endpoint relevante retorna 500
- Contratos de Campaign estáveis e documentados
- Lógica de targeting consistente entre endpoints “active” (portal e tablets)
- Filtros e estrutura de `/api/stations/available` estáveis

## 9) Observabilidade e Erros Padronizados
- Logar e corrigir 500 com mensagens úteis
- Padrão de erro JSON com `detail`/`message` e `X-Request-ID` para correlação (opcional)

