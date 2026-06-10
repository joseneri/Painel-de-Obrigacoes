using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PainelObrigacoes.Api.Endpoints;
using PainelObrigacoes.Api.Errors;
using PainelObrigacoes.Api.Observability;
using PainelObrigacoes.Application.Services.Empresas;
using PainelObrigacoes.Application.Services.Entregas;
using PainelObrigacoes.Application.Services.Obrigacoes;
using PainelObrigacoes.Domain.Services;
using PainelObrigacoes.Infrastructure.Extensions;
using PainelObrigacoes.Infrastructure.External;
using PainelObrigacoes.Infrastructure.Persistence;
using PainelObrigacoes.Infrastructure.Persistence.Seed;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Extensions["traceId"] = CorrelationIds.GetTraceId(context.HttpContext);
        context.ProblemDetails.Extensions["correlationId"] =
            CorrelationIds.GetCorrelationId(context.HttpContext);
    };
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5241",
                "http://127.0.0.1:5241",
                "http://localhost:8081",
                "http://127.0.0.1:8081")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithExposedHeaders(
                CorrelationIds.CorrelationHeaderName,
                CorrelationIds.TraceHeaderName);
    });
});
builder.Logging.Configure(options =>
{
    options.ActivityTrackingOptions = ActivityTrackingOptions.TraceId |
        ActivityTrackingOptions.SpanId;
});

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<ObrigacaoRulesEngine>();
builder.Services.AddSingleton<VencimentoCalculator>();
builder.Services.AddScoped<CreateEmpresaService>();
builder.Services.AddScoped<GetEmpresasService>();
builder.Services.AddScoped<DeleteEmpresaService>();
builder.Services.AddScoped<GetCalendarioService>();
builder.Services.AddScoped<GetAlertasService>();
builder.Services.AddScoped<GetDashboardService>();
builder.Services.AddScoped<EnsureObrigacoesFuturasService>();
builder.Services.AddScoped<RegistrarEntregaService>();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors("Frontend");
app.MapGet("/health", () => Results.Ok(new { status = "ok", utc = DateTime.UtcNow }));
app.MapGroup("/api/empresas").WithTags("Empresas").MapEmpresasEndpoints();
app.MapGroup("/api/obrigacoes").WithTags("Obrigações").MapObrigacoesEndpoints();
app.MapGroup("/api/entregas").WithTags("Entregas").MapEntregasEndpoints();

await ApplyMigrationsAndSeedAsync(app);
await app.RunAsync();

static async Task ApplyMigrationsAndSeedAsync(WebApplication app)
{
    await using var scope = app.Services.CreateAsyncScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var feriadoSync = scope.ServiceProvider.GetRequiredService<FeriadoNacionalSyncService>();
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    var ensureObrigacoes = scope.ServiceProvider.GetRequiredService<EnsureObrigacoesFuturasService>();

    await dbContext.Database.MigrateAsync();
    await feriadoSync.SyncAsync(CancellationToken.None);
    await seeder.SeedAsync();
    await ensureObrigacoes.EnsureForTodasEmpresasAsync(CancellationToken.None);
}
