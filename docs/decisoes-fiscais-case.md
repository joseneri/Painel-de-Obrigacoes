# Decisoes Fiscais do Case

Este documento registra as decisoes implementadas para ambiguidades de regra de
negocio do case do Painel de Obrigacoes Acessorias. Ele complementa o README e
ajuda a explicar os edge cases de regime e vencimento avaliados no desafio.

## Competencia e Vencimento

Competencia e vencimento sao dimensoes diferentes:

- `Competencia` explica de onde a obrigacao vem e qual periodo fiscal ela
  representa.
- `DataVencimento` determina status, alertas, atraso e ordenacao por urgencia.

Resumo para defesa tecnica:

> Competencia explica de onde a obrigacao vem; vencimento manda no status,
> alertas e urgencia.

Essa separacao e importante principalmente para obrigacoes anuais. Elas aparecem
apenas em janeiro por exigencia do case, mas vencem em fevereiro, marco, maio ou
julho, dependendo da obrigacao.

## Obrigacoes Anuais

As obrigacoes anuais aparecem somente na competencia de janeiro de cada ano:

- DEFIS;
- DIRF;
- RAIS;
- SPED ECD;
- SPED ECF.

A interpretacao adotada e que `Jan/2026` representa o ciclo anual controlado em
2026, referente ao exercicio ou ano-calendario anterior.

| Obrigacao | Competencia de controle | Referencia | Vencimento |
| --- | --- | --- | --- |
| DIRF | Jan/2026 | Ano-calendario 2025 | ultimo dia de fev/2026 ajustado |
| DEFIS | Jan/2026 | Exercicio 2025 | 31/03/2026 ajustado |
| RAIS | Jan/2026 | Ano-base 2025 | 31/03/2026 ajustado |
| SPED ECD | Jan/2026 | Exercicio 2025 | 31/05/2026 ajustado |
| SPED ECF | Jan/2026 | Exercicio 2025 | 31/07/2026 ajustado |

Consequencia para a aplicacao:

- a visao por competencia mostra as anuais em janeiro;
- alertas, atrasos e urgencia usam o vencimento real;
- a tabela deve mostrar competencia/referencia e vencimento juntos.

## Politica de Dia Util

O PDF explicita a prorrogacao para proximo dia util apenas no DAS. Como os
criterios de avaliacao citam edge cases de vencimento, a decisao para manter o
calendario consistente e:

> Todo vencimento calculado pelo perfil do case parte de uma data-base. Se essa
> data-base cair em sabado, domingo ou feriado nacional, o sistema prorroga para
> o proximo dia util.

Os feriados nacionais nao ficam hardcoded no Domain. A API sincroniza a
BrasilAPI para o ano corrente e os proximos 4 anos, persiste o resultado no
banco e o calculo usa esse cache local. Assim a fonte pode ser atualizada sem
deploy, mas a geracao de obrigacoes nao depende de chamada externa em tempo real.

Limites documentados:

- feriados estaduais e municipais ficam fora do escopo;
- pontos facultativos ficam fora do escopo;
- regras reais que antecipam vencimento ficam fora do escopo;
- regras por UF, como EFD-ICMS/IPI, ficam fora do escopo;
- o PDF do case prevalece sobre divergencias da legislacao atual.

## Status

O status segue a data de vencimento e a existencia de entrega:

- `Pendente`: vencimento futuro ou no dia atual, sem entrega registrada.
- `Atrasada`: vencimento anterior a data atual, sem entrega registrada.
- `Entregue`: entrega registrada com data de conclusao.
- `Nao Aplicavel`: obrigacao nao se aplica ao regime tributario.

No dia do vencimento a obrigacao ainda esta pendente. Ela so fica atrasada no
dia seguinte, se nao houver entrega.

## Regime Tributario

Os testes devem cobrir a matriz minima do case:

- Simples Nacional: DAS, eSocial, DEFIS, DIRF e RAIS.
- Lucro Presumido: DCTF, EFD-ICMS/IPI, EFD Contribuicoes, EFD-Reinf, eSocial,
  SPED ECD, SPED ECF, DIRF e RAIS.
- Lucro Real: mesma matriz do Lucro Presumido.
- Imune/Isento: sem obrigacoes nesta versao, porque o PDF diz "dispensadas da
  maioria", mas nao define uma matriz propria.

## Fora do Escopo

Esta entrega implementa o perfil de regras do case, nao um motor fiscal completo.
Ficam fora do escopo:

- legislacao atual completa quando divergir do PDF;
- regras estaduais/municipais;
- feriados locais;
- pontos facultativos;
- regras por UF;
- regras versionadas por ano-calendario;
- substituicoes atuais como fim da DIRF ou RAIS substituida por eSocial.
