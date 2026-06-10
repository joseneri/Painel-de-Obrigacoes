using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.Services.Obrigacoes;

public sealed class GetAlertasService(
    IObrigacaoRepository obrigacaoRepository,
    IQueryCache queryCache,
    TimeProvider timeProvider)
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(30);

    public async Task<IReadOnlyCollection<AlertaDto>> ExecuteAsync(CancellationToken cancellationToken)
    {
        var today = timeProvider.GetUtcNow().UtcDateTime.Date;
        var cacheKey = QueryCacheKeys.Alertas(DateOnly.FromDateTime(today));

        return await queryCache.GetOrCreateAsync(
            cacheKey,
            CacheDuration,
            ExecuteCoreAsync,
            cancellationToken);

        async Task<IReadOnlyCollection<AlertaDto>> ExecuteCoreAsync(CancellationToken token)
        {
            var limit = today.AddDays(30);
            var obrigacoes = await obrigacaoRepository.GetAlertasAsync(today, limit, token);

            return obrigacoes
                .Select(obrigacao =>
                {
                    obrigacao.RecalcularStatus(today);
                    return obrigacao;
                })
                .Where(obrigacao => obrigacao.Status is StatusObrigacao.Atrasada or StatusObrigacao.Pendente)
                .OrderBy(obrigacao => AlertPriority(obrigacao, today))
                .ThenBy(obrigacao => obrigacao.DataVencimento)
                .Select(obrigacao => DtoMapper.ToAlertaDto(obrigacao, today))
                .ToArray();
        }
    }

    private static int AlertPriority(Obrigacao obrigacao, DateTime today)
    {
        return obrigacao.DataVencimento.Date < today.Date ? 0 : 1;
    }
}
