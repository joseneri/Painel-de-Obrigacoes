# Instruções para Agentes de IA

## Leia Sempre Antes de Qualquer Resposta
1. Leia `docs/architecture.md` para entender restrições e padrões do projeto.
2. Consulte a pasta `tmp/` para ver pesquisas e planos já realizados.
3. Nunca escreva código sem antes ter um plano em `tmp/plano-execucao.md`.

## Este Projeto
Painel de Obrigações Acessórias: backend .NET 9 para a e-Auditoria.
Sistema de calendário fiscal: não calcula impostos. Gera e controla obrigações
tributárias por regime: Simples Nacional, Lucro Presumido, Lucro Real e
Imune/Isento.

## Regras de Ouro
- Domain layer: zero imports de `Microsoft.*` ou `System.Data.*`.
- Nenhum arquivo deve passar de 250 linhas.
- Engine de regras: stateless, sem injeção de infraestrutura.
- Testes antes de avançar para a camada seguinte.
- Sempre salve planos em `tmp/` antes de codificar.
- Antes de qualquer commit, atualize `docs/ia-showcase-guide.md` com as
  decisões técnicas, uso de IA, validações e pontos de apresentação daquela
  mudança. Se o hash final ainda não existir, registre o assunto do commit e
  complete o hash na atualização seguinte.

## Hand-Off
Se esta conversa ficar longa, gere um resumo de hand-off em Markdown com:
o que foi feito, o que está pendente, decisões tomadas e próximo passo.
