using Microsoft.Extensions.Logging;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.UseCases.Entregas;

namespace PainelObrigacoes.Api.Endpoints;

public static class EntregasEndpoints
{
    public static RouteGroupBuilder MapEntregasEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost(string.Empty, async (
            RegistrarEntregaDto input,
            RegistrarEntregaUseCase useCase,
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => useCase.ExecuteAsync(input, cancellationToken),
                result => Results.Created($"/api/entregas/{result.Id}", result),
                loggerFactory);
        });

        return group;
    }
}
