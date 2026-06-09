using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
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
            .OrderByDescending(obrigacao => obrigacao.Status == StatusObrigacao.Atrasada)
            .ThenBy(obrigacao => obrigacao.DataVencimento)
            .Select(obrigacao => DtoMapper.ToAlertaDto(obrigacao, today))
            .ToArray();
    }
}
