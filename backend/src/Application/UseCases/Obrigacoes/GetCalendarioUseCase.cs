using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Application.UseCases.Obrigacoes;

public sealed class GetCalendarioUseCase(
    IObrigacaoRepository obrigacaoRepository,
    TimeProvider timeProvider)
{
    public async Task<IReadOnlyCollection<ObrigacaoDto>> ExecuteAsync(
        Guid? empresaId,
        int? ano,
        int? mes,
        StatusObrigacao? status,
        CancellationToken cancellationToken)
    {
        var competencia = BuildCompetencia(ano, mes);
        var today = timeProvider.GetUtcNow().UtcDateTime;
        var obrigacoes = await obrigacaoRepository.GetCalendarioAsync(
            empresaId,
            competencia,
            status: null,
            cancellationToken);

        return obrigacoes
            .Select(obrigacao =>
            {
                obrigacao.RecalcularStatus(today);
                return obrigacao;
            })
            .Where(obrigacao => status is null || obrigacao.Status == status)
            .OrderBy(obrigacao => obrigacao.DataVencimento)
            .Select(DtoMapper.ToDto)
            .ToArray();
    }

    private static Competencia? BuildCompetencia(int? ano, int? mes)
    {
        if (ano is null && mes is null)
        {
            return null;
        }

        if (ano is null || mes is null)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["competencia"] = ["Informe ano e mês juntos para filtrar por competência."]
            });
        }

        return new Competencia(ano.Value, mes.Value);
    }
}

