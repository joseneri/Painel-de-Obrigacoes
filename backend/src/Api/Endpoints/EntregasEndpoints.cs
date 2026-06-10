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
            CancellationToken cancellationToken) =>
        {
            var result = await service.ExecuteAsync(input, cancellationToken);
            return Results.Created($"/api/entregas/{result.Id}", result);
        });

        return group;
    }
}
