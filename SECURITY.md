# Notas de Segurança

## Vulnerabilidades Conhecidas

### esbuild / vite
- **Severidade:** Moderada
- **Versões afetadas:** esbuild <=0.24.2, vite <=6.1.6
- **Descrição:** esbuild permite que qualquer website envie requisições ao servidor de desenvolvimento
- **Impacto:** Afeta apenas ambiente de desenvolvimento, não produção
- **Status:** Mantendo versão atual (vite 4.4.5) por estabilidade

### Decisão de Não Atualizar

Optamos por manter a versão atual pelos seguintes motivos:

1. **Apenas Desenvolvimento:** A vulnerabilidade afeta apenas o servidor de desenvolvimento
2. **Breaking Changes:** Atualizar para vite 7+ requer mudanças significativas no código
3. **Estabilidade:** A versão atual está estável e funcional

### Mitigação

Para desenvolvimento seguro:
- Não execute `npm run dev` em redes públicas
- Use apenas em localhost
- Para produção, sempre use `npm run build`

### Futura Atualização

Quando migrar para Vite 7+, considerar:
- Revisar mudanças de configuração
- Testar compatibilidade com todas as dependências
- Atualizar configurações de build se necessário