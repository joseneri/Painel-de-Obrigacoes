using PainelObrigacoes.Application.UseCases.Obrigacoes;
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
            GetCalendarioUseCase useCase,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => useCase.ExecuteAsync(empresaId, ano, mes, status, cancellationToken),
                Results.Ok);
        });

        group.MapGet("/alertas", async (
            GetAlertasUseCase useCase,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => useCase.ExecuteAsync(cancellationToken),
                Results.Ok);
        });

        group.MapGet("/dashboard", async (
            GetDashboardUseCase useCase,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => useCase.ExecuteAsync(cancellationToken),
                Results.Ok);
        });

        return group;
    }
}

