namespace PainelObrigacoes.Api.Observability;

internal sealed class CorrelationIdMiddleware(
    RequestDelegate next,
    ILogger<CorrelationIdMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext httpContext)
    {
        var correlationId = ResolveCorrelationId(httpContext);
        httpContext.Items[CorrelationIds.CorrelationItemKey] = correlationId;

        httpContext.Response.OnStarting(() =>
        {
            httpContext.Response.Headers[CorrelationIds.CorrelationHeaderName] = correlationId;
            httpContext.Response.Headers[CorrelationIds.TraceHeaderName] =
                CorrelationIds.GetTraceId(httpContext);
            return Task.CompletedTask;
        });

        using var scope = logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["TraceId"] = CorrelationIds.GetTraceId(httpContext)
        });

        logger.LogInformation(
            "HTTP {Method} {Path} iniciado. CorrelationId={CorrelationId} TraceId={TraceId}",
            httpContext.Request.Method,
            httpContext.Request.Path,
            correlationId,
            CorrelationIds.GetTraceId(httpContext));

        await next(httpContext);
    }

    private static string ResolveCorrelationId(HttpContext httpContext)
    {
        var headerValue = httpContext.Request.Headers[CorrelationIds.CorrelationHeaderName]
            .FirstOrDefault();

        if (!string.IsNullOrWhiteSpace(headerValue) &&
            headerValue.Length <= 128 &&
            !headerValue.Any(char.IsControl))
        {
            return headerValue;
        }

        return Guid.NewGuid().ToString("N");
    }
}
