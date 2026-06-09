using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.Services.Obrigacoes;

public sealed class GetAlertasService(
    IObrigacaoRepository obrigacaoRepository,
    TimeProvider timeProvider)
{
    public async Task<IReadOnlyCollection<AlertaDto>> ExecuteAsync(CancellationToken cancellationToken)
    {
        var today = timeProvider.GetUtcNow().UtcDateTime.Date;
        var limit = today.AddDays(30);
        var obrigacoes = await obrigacaoRepository.GetAlertasAsync(today, limit, cancellationToken);

        return obrigacoes
            .Select(obrigacao =>
            {
                obrigacao.RecalcularStatus(today);
                return obrigacao;
            })
            .Where(obrigacao => obrigacao.Status is StatusObrigacao.Atrasada or StatusObrigacao.Pendente)
            .OrderBy(obrigacao => AlertPriority(obrigacao, today))
            .ThenBy(obrigacao => Math.Abs((obrigacao.DataVencimento.Date - today).Days))
            .ThenBy(obrigacao => obrigacao.DataVencimento)
            .Select(obrigacao => DtoMapper.ToAlertaDto(obrigacao, today))
            .ToArray();
    }

    private static int AlertPriority(Obrigacao obrigacao, DateTime today)
    {
        return obrigacao.DataVencimento.Date >= today.Date ? 0 : 1;
    }
}
