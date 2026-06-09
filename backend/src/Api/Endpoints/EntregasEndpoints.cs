using Microsoft.Extensions.Logging;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Services.Entregas;

namespace PainelObrigacoes.Api.Endpoints;

public static class EntregasEndpoints
{
    public static RouteGroupBuilder MapEntregasEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost(string.Empty, async (
            RegistrarEntregaDto input,
            RegistrarEntregaService service,
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => service.ExecuteAsync(input, cancellationToken),
                result => Results.Created($"/api/entregas/{result.Id}", result),
                loggerFactory);
        });

        return group;
    }
}
