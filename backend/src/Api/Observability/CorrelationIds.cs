using System.Diagnostics;

namespace PainelObrigacoes.Api.Observability;

internal static class CorrelationIds
{
    public const string CorrelationHeaderName = "X-Correlation-ID";
    public const string TraceHeaderName = "X-Trace-ID";
    public const string CorrelationItemKey = "CorrelationId";

    public static string GetTraceId(HttpContext httpContext)
    {
        return Activity.Current?.TraceId.ToString() ?? httpContext.TraceIdentifier;
    }

    public static string GetCorrelationId(HttpContext httpContext)
    {
        return httpContext.Items.TryGetValue(CorrelationItemKey, out var value) &&
            value is string correlationId
                ? correlationId
                : GetTraceId(httpContext);
    }
}
