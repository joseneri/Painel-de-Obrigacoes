using Microsoft.EntityFrameworkCore;
using PainelObrigacoes.Api.Endpoints;
using PainelObrigacoes.Application.Services.Empresas;
using PainelObrigacoes.Application.Services.Entregas;
using PainelObrigacoes.Application.Services.Obrigacoes;
using PainelObrigacoes.Domain.Services;
using PainelObrigacoes.Infrastructure.Extensions;
using PainelObrigacoes.Infrastructure.Persistence;
using PainelObrigacoes.Infrastructure.Persistence.Seed;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5241",
                "http://127.0.0.1:5241")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
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
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    var ensureObrigacoes = scope.ServiceProvider.GetRequiredService<EnsureObrigacoesFuturasService>();

    await dbContext.Database.MigrateAsync();
    await seeder.SeedAsync();
    await ensureObrigacoes.EnsureForTodasEmpresasAsync(CancellationToken.None);
}
