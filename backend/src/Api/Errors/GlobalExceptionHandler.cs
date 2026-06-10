using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PainelObrigacoes.Api.Observability;
using PainelObrigacoes.Application.Common;

namespace PainelObrigacoes.Api.Errors;

internal sealed class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (httpContext.Response.HasStarted)
        {
            return false;
        }

        var problemDetails = CreateProblemDetails(httpContext, exception);
        LogException(httpContext, exception, problemDetails.Status);
        httpContext.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;

        if (await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
            {
                HttpContext = httpContext,
                Exception = exception,
                ProblemDetails = problemDetails
            }))
        {
            return true;
        }

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }

    private static ProblemDetails CreateProblemDetails(HttpContext httpContext, Exception exception)
    {
        return exception switch
        {
            ValidationException validationException => CreateValidationProblemFromException(validationException),
            ConflictException conflictException => CreateProblem(
                "Conflito de dados.",
                conflictException.Message,
                StatusCodes.Status409Conflict),
            NotFoundException notFoundException => CreateProblem(
                "Recurso nao encontrado.",
                notFoundException.Message,
                StatusCodes.Status404NotFound),
            ArgumentOutOfRangeException => CreateValidationProblemFromErrors(new Dictionary<string, string[]>
            {
                ["request"] = ["Valor informado e invalido."]
            }),
            BadHttpRequestException => CreateProblem(
                "Requisicao invalida.",
                "Revise o payload e os parametros enviados.",
                StatusCodes.Status400BadRequest),
            DbUpdateException => CreateProblem(
                "Conflito de dados.",
                "A operacao nao pode ser concluida por conflito de dados.",
                StatusCodes.Status409Conflict),
            _ => CreateProblem(
                "Erro inesperado.",
                "Ocorreu um erro inesperado ao processar a requisicao.",
                StatusCodes.Status500InternalServerError)
        };

        ProblemDetails CreateValidationProblemFromException(ValidationException validationException)
        {
            return CreateValidationProblemFromErrors(validationException.Errors);
        }

        ProblemDetails CreateValidationProblemFromErrors(IReadOnlyDictionary<string, string[]> errors)
        {
            return new HttpValidationProblemDetails(
                errors.ToDictionary(error => error.Key, error => error.Value))
            {
                Title = "Uma ou mais validacoes falharam.",
                Status = StatusCodes.Status400BadRequest,
                Instance = httpContext.Request.Path
            };
        }

        ProblemDetails CreateProblem(string title, string detail, int statusCode)
        {
            return new ProblemDetails
            {
                Title = title,
                Detail = detail,
                Status = statusCode,
                Instance = httpContext.Request.Path
            };
        }
    }

    private void LogException(HttpContext httpContext, Exception exception, int? statusCode)
    {
        var correlationId = CorrelationIds.GetCorrelationId(httpContext);
        var traceId = CorrelationIds.GetTraceId(httpContext);

        if (exception is ValidationException or ConflictException or NotFoundException)
        {
            logger.LogInformation(
                "Erro conhecido HTTP {StatusCode}. CorrelationId={CorrelationId} TraceId={TraceId}",
                statusCode,
                correlationId,
                traceId);
            return;
        }

        if (exception is ArgumentOutOfRangeException or BadHttpRequestException or DbUpdateException)
        {
            logger.LogWarning(
                exception,
                "Erro tratado HTTP {StatusCode}. CorrelationId={CorrelationId} TraceId={TraceId}",
                statusCode,
                correlationId,
                traceId);
            return;
        }

        logger.LogError(
            exception,
            "Erro inesperado HTTP {StatusCode}. CorrelationId={CorrelationId} TraceId={TraceId}",
            statusCode,
            correlationId,
            traceId);
    }
}
