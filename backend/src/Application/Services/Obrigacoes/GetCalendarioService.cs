using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Application.Services.Obrigacoes;

public sealed class GetCalendarioService(
    IObrigacaoRepository obrigacaoRepository,
    TimeProvider timeProvider)
{
    public async Task<IReadOnlyCollection<ObrigacaoDto>> ExecuteAsync(
        Guid? empresaId,
        int? ano,
        int? mes,
        StatusObrigacao? status,
        string? modo,
        CancellationToken cancellationToken)
    {
        var competencia = BuildCompetencia(ano, mes);
        var today = timeProvider.GetUtcNow().UtcDateTime;
        var obrigacoes = await GetObrigacoesAsync(
            empresaId,
            competencia,
            ParseModo(modo),
            cancellationToken);

        return obrigacoes
            .Select(obrigacao =>
            {
                obrigacao.RecalcularStatus(today);
                return obrigacao;
            })
            .Where(obrigacao => status is null || obrigacao.Status == status)
            .OrderBy(obrigacao => obrigacao.DataVencimento)
            .Select(obrigacao => DtoMapper.ToDto(obrigacao, today))
            .ToArray();
    }

    private async Task<IReadOnlyCollection<Obrigacao>> GetObrigacoesAsync(
        Guid? empresaId,
        Competencia? competencia,
        CalendarioModo modo,
        CancellationToken cancellationToken)
    {
        if (modo == CalendarioModo.Competencia)
        {
            return await obrigacaoRepository.GetCalendarioAsync(
                empresaId,
                competencia,
                status: null,
                cancellationToken);
        }

        var (inicio, fimExclusivo) = BuildPeriodoVencimento(competencia);
        return await obrigacaoRepository.GetByVencimentoAsync(
            empresaId,
            inicio,
            fimExclusivo,
            cancellationToken);
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

    private static (DateTime? Inicio, DateTime? FimExclusivo) BuildPeriodoVencimento(
        Competencia? competencia)
    {
        if (competencia is null)
        {
            return (null, null);
        }

        var inicio = new DateTime(competencia.Value.Ano, competencia.Value.Mes, 1, 0, 0, 0, DateTimeKind.Utc);
        return (inicio, inicio.AddMonths(1));
    }

    private static CalendarioModo ParseModo(string? modo)
    {
        if (string.IsNullOrWhiteSpace(modo) ||
            string.Equals(modo, "competencia", StringComparison.OrdinalIgnoreCase))
        {
            return CalendarioModo.Competencia;
        }

        if (string.Equals(modo, "vencimento", StringComparison.OrdinalIgnoreCase))
        {
            return CalendarioModo.Vencimento;
        }

        throw new ValidationException(new Dictionary<string, string[]>
        {
            ["modo"] = ["Use 'competencia' ou 'vencimento'."]
        });
    }

    private enum CalendarioModo
    {
        Competencia,
        Vencimento
    }
}
