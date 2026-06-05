using PainelObrigacoes.Application.Common;

namespace PainelObrigacoes.Api.Endpoints;

internal static class EndpointErrorHandler
{
    public static async Task<IResult> ExecuteAsync<T>(Func<Task<T>> action, Func<T, IResult> success)
    {
        try
        {
            return success(await action());
        }
        catch (ValidationException exception)
        {
            return Results.ValidationProblem(exception.Errors.ToDictionary());
        }
        catch (NotFoundException exception)
        {
            return Results.Problem(
                title: "Recurso não encontrado.",
                detail: exception.Message,
                statusCode: StatusCodes.Status404NotFound);
        }
        catch (Exception exception)
        {
            return Results.Problem(
                title: "Erro inesperado.",
                detail: exception.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    public static async Task<IResult> ExecuteAsync(Func<Task> action, Func<IResult> success)
    {
        return await ExecuteAsync(
            async () =>
            {
                await action();
                return true;
            },
            _ => success());
    }
}

