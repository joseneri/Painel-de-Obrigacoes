using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Application.Common;

public static class QueryCacheKeys
{
    public const string AllPrefix = "queries:";

    public static string Dashboard(DateOnly today)
    {
        return $"{AllPrefix}dashboard:{today:yyyyMMdd}";
    }

    public static string Alertas(DateOnly today)
    {
        return $"{AllPrefix}alertas:{today:yyyyMMdd}";
    }

    public static string Calendario(
        DateOnly today,
        Guid? empresaId,
        Competencia? competencia,
        StatusObrigacao? status,
        string modo)
    {
        var empresaKey = empresaId?.ToString("N") ?? "todas";
        var competenciaKey = competencia is null
            ? "todas"
            : $"{competencia.Value.Ano:0000}{competencia.Value.Mes:00}";
        var statusKey = status?.ToString() ?? "todos";

        return $"{AllPrefix}calendario:{today:yyyyMMdd}:{modo}:{empresaKey}:{competenciaKey}:{statusKey}";
    }
}
