using Microsoft.Extensions.Logging;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.UseCases.Empresas;

namespace PainelObrigacoes.Api.Endpoints;

public static class EmpresasEndpoints
{
    public static RouteGroupBuilder MapEmpresasEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet(string.Empty, async (
            GetEmpresasUseCase useCase,
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => useCase.ExecuteAsync(cancellationToken),
                Results.Ok,
                loggerFactory);
        });

        group.MapPost(string.Empty, async (
            CreateEmpresaDto input,
            CreateEmpresaUseCase useCase,
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => useCase.ExecuteAsync(input, cancellationToken),
                result => Results.Created($"/api/empresas/{result.Id}", result),
                loggerFactory);
        });

        group.MapDelete("/{id:guid}", async (
            Guid id,
            DeleteEmpresaUseCase useCase,
            ILoggerFactory loggerFactory,
            CancellationToken cancellationToken) =>
        {
            return await EndpointErrorHandler.ExecuteAsync(
                () => useCase.ExecuteAsync(id, cancellationToken),
                Results.NoContent,
                loggerFactory);
        });

        return group;
    }
}
