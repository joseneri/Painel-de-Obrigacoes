using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Services.Empresas;

namespace PainelObrigacoes.Api.Endpoints;

public static class EmpresasEndpoints
{
    public static RouteGroupBuilder MapEmpresasEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet(string.Empty, async (
            GetEmpresasService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.ExecuteAsync(cancellationToken);
            return Results.Ok(result);
        });

        group.MapGet("/{id:guid}/entregas", async (
            Guid id,
            GetHistoricoEntregasEmpresaService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.ExecuteAsync(id, cancellationToken);
            return Results.Ok(result);
        });

        group.MapPost(string.Empty, async (
            CreateEmpresaDto input,
            CreateEmpresaService service,
            CancellationToken cancellationToken) =>
        {
            var result = await service.ExecuteAsync(input, cancellationToken);
            return Results.Created($"/api/empresas/{result.Id}", result);
        });

        group.MapDelete("/{id:guid}", async (
            Guid id,
            DeleteEmpresaService service,
            CancellationToken cancellationToken) =>
        {
            await service.ExecuteAsync(id, cancellationToken);
            return Results.NoContent();
        });

        return group;
    }
}
