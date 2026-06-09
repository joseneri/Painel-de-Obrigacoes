using Microsoft.Extensions.Logging;
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
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => service.ExecuteAsync(empresaId, ano, mes, status, modo, cancellationToken),
                Results.Ok,
                loggerFactory);
        });

        group.MapGet("/alertas", async (
            GetAlertasService service,
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => service.ExecuteAsync(cancellationToken),
                Results.Ok,
                loggerFactory);
        });

        group.MapGet("/dashboard", async (
            GetDashboardService service,
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => service.ExecuteAsync(cancellationToken),
                Results.Ok,
                loggerFactory);
        });

        return group;
    }
}
