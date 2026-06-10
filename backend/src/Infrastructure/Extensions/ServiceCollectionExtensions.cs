using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Infrastructure.Caching;
using PainelObrigacoes.Infrastructure.External;
using PainelObrigacoes.Infrastructure.Persistence;
using PainelObrigacoes.Infrastructure.Persistence.Repositories;
using PainelObrigacoes.Infrastructure.Persistence.Seed;

namespace PainelObrigacoes.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Connection string 'Default' não configurada.");

        services.AddMemoryCache();
        services.AddSingleton<IQueryCache, MemoryQueryCache>();
        services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<IEmpresaRepository, EmpresaRepository>();
        services.AddScoped<IFeriadoNacionalRepository, FeriadoNacionalRepository>();
        services.AddScoped<IObrigacaoRepository, ObrigacaoRepository>();
        services.AddScoped<DatabaseSeeder>();
        services.AddScoped<FeriadoNacionalSyncService>();
        services.AddHttpClient<BrasilApiFeriadosClient>(client =>
        {
            client.BaseAddress = new Uri("https://brasilapi.com.br/");
            client.Timeout = TimeSpan.FromSeconds(10);
        });

        return services;
    }
}
