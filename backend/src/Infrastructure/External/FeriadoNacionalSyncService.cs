using Microsoft.Extensions.Logging;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Infrastructure.External;

public sealed class FeriadoNacionalSyncService(
    BrasilApiFeriadosClient brasilApiClient,
    IFeriadoNacionalRepository feriadoRepository,
    TimeProvider timeProvider,
    ILogger<FeriadoNacionalSyncService> logger)
{
    private const int AnosParaSincronizar = 5;

    public async Task SyncAsync(CancellationToken cancellationToken)
    {
        var anoAtual = timeProvider.GetUtcNow().UtcDateTime.Year;
        var anos = Enumerable.Range(anoAtual, AnosParaSincronizar).ToArray();
        var sincronizadoEm = timeProvider.GetUtcNow().UtcDateTime;

        try
        {
            foreach (var ano in anos)
            {
                var feriados = await brasilApiClient.GetFeriadosAsync(ano, sincronizadoEm, cancellationToken);
                await feriadoRepository.UpsertRangeAsync(feriados, cancellationToken);
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception exception)
        {
            if (await HasCacheSuficienteAsync(anos, cancellationToken))
            {
                logger.LogWarning(
                    exception,
                    "BrasilAPI indisponivel; usando cache local de feriados nacionais.");
                return;
            }

            throw new InvalidOperationException(
                "Nao foi possivel sincronizar feriados nacionais pela BrasilAPI e nao ha cache local suficiente.",
                exception);
        }
    }

    private async Task<bool> HasCacheSuficienteAsync(int[] anos, CancellationToken cancellationToken)
    {
        var anosComCache = await feriadoRepository.GetAnosComCacheAsync(
            anos.Min(),
            anos.Max(),
            cancellationToken);

        return anos.All(anosComCache.Contains);
    }
}
