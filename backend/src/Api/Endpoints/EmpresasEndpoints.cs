using Microsoft.Extensions.Logging;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Services.Empresas;

namespace PainelObrigacoes.Api.Endpoints;

public static class EmpresasEndpoints
{
    public static RouteGroupBuilder MapEmpresasEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet(string.Empty, async (
            GetEmpresasService service,
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => service.ExecuteAsync(cancellationToken),
                Results.Ok,
                loggerFactory);
        });

        group.MapPost(string.Empty, async (
            CreateEmpresaDto input,
            CreateEmpresaService service,
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => service.ExecuteAsync(input, cancellationToken),
                result => Results.Created($"/api/empresas/{result.Id}", result),
                loggerFactory);
        });

        group.MapDelete("/{id:guid}", async (
            Guid id,
            DeleteEmpresaService service,
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => service.ExecuteAsync(id, cancellationToken),
                Results.NoContent,
                loggerFactory);
        });

        return group;
    }
}
