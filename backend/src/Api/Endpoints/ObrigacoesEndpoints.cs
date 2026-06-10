using PainelObrigacoes.Application.Services.Obrigacoes;
using PainelObrigacoes.Domain.Enums;

namespace PainelObrigacoes.Api.Endpoints;

public static class ObrigacoesEndpoints
{
    public static RouteGroupBuilder MapObrigacoesEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet(string.Empty, async (
            Guid? empresaId,
            int? ano,
            int? mes,
            StatusObrigacao? status,
            string? modo,
            GetCalendarioService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.ExecuteAsync(
                empresaId,
                ano,
                mes,
                status,
                modo,
                cancellationToken);
            return Results.Ok(result);
        });

        group.MapGet("/alertas", async (
            GetAlertasService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.ExecuteAsync(cancellationToken);
            return Results.Ok(result);
        });

        group.MapGet("/dashboard", async (
            GetDashboardService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.ExecuteAsync(cancellationToken);
            return Results.Ok(result);
        });

        return group;
    }
}
