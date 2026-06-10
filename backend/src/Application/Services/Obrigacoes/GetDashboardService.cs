using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.Services.Obrigacoes;

public sealed class GetDashboardService(
    IEmpresaRepository empresaRepository,
    IObrigacaoRepository obrigacaoRepository,
    IQueryCache queryCache,
    TimeProvider timeProvider)
{
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(30);

    public async Task<DashboardDto> ExecuteAsync(CancellationToken cancellationToken)
    {
        var today = timeProvider.GetUtcNow().UtcDateTime.Date;
        var cacheKey = QueryCacheKeys.Dashboard(DateOnly.FromDateTime(today));

        return await queryCache.GetOrCreateAsync(
            cacheKey,
            CacheDuration,
            ExecuteCoreAsync,
            cancellationToken);

        async Task<DashboardDto> ExecuteCoreAsync(CancellationToken token)
        {
            var inicioMes = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var totalEmpresas = await empresaRepository.CountAsync(token);
            var obrigacoes = await obrigacaoRepository.GetByVencimentoAsync(
                empresaId: null,
                inicio: null,
                fimExclusivo: null,
                cancellationToken: token);
            var fimMes = inicioMes.AddMonths(1);

            foreach (var obrigacao in obrigacoes)
            {
                obrigacao.RecalcularStatus(today);
            }

            return new DashboardDto(
                totalEmpresas,
                obrigacoes.Count(o => o.DataVencimento >= inicioMes && o.DataVencimento < fimMes),
                obrigacoes.Count(o => o.Status == StatusObrigacao.Pendente),
                obrigacoes.Count(o => o.Status == StatusObrigacao.Entregue),
                obrigacoes.Count(o => o.Status == StatusObrigacao.Atrasada));
        }
    }
}
