using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PainelObrigacoes.Application.Common;

namespace PainelObrigacoes.Api.Endpoints;

internal static class EndpointErrorHandler
{
    public static async Task<IResult> ExecuteAsync<T>(
        Func<Task<T>> action,
        Func<T, IResult> success,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("PainelObrigacoes.Api.EndpointErrorHandler");

        try
        {
            return success(await action());
        }
        catch (ValidationException exception)
        {
            return Results.ValidationProblem(exception.Errors.ToDictionary());
        }
        catch (ConflictException exception)
        {
            return Results.Problem(
                title: "Conflito de dados.",
                detail: exception.Message,
                statusCode: StatusCodes.Status409Conflict);
        }
        catch (NotFoundException exception)
        {
            return Results.Problem(
                title: "Recurso nao encontrado.",
                detail: exception.Message,
                statusCode: StatusCodes.Status404NotFound);
        }
        catch (ArgumentOutOfRangeException exception)
        {
            logger.LogWarning(exception, "Valor fora do intervalo aceito.");

            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["request"] = ["Valor informado e invalido."]
            });
        }
        catch (DbUpdateException exception)
        {
            logger.LogWarning(exception, "Conflito ao persistir dados.");

            return Results.Problem(
                title: "Conflito de dados.",
                detail: "A operacao nao pode ser concluida por conflito de dados.",
                statusCode: StatusCodes.Status409Conflict);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Erro inesperado no endpoint.");

            return Results.Problem(
                title: "Erro inesperado.",
                detail: "Ocorreu um erro inesperado ao processar a requisicao.",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    public static async Task<IResult> ExecuteAsync(
        Func<Task> action,
        Func<IResult> success,
        ILoggerFactory loggerFactory)
    {
        return await ExecuteAsync(
            async () =>
            {
                await action();
                return true;
            },
            _ => success(),
            loggerFactory);
    }
}
