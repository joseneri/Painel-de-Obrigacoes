using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.Tests;

internal sealed class FakeFeriadoNacionalRepository(
    IReadOnlyCollection<FeriadoNacional>? feriados = null) : IFeriadoNacionalRepository
{
    private readonly List<FeriadoNacional> _feriados = [.. feriados ?? []];

    public Task<IReadOnlyCollection<FeriadoNacional>> GetByPeriodoAsync(
        DateTime inicio,
        DateTime fim,
        CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<FeriadoNacional>>(
            _feriados
                .Where(f => f.Data >= inicio.Date && f.Data <= fim.Date)
                .ToArray());
    }

    public Task<IReadOnlyCollection<int>> GetAnosComCacheAsync(
        int anoInicio,
        int anoFim,
        CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<int>>(
            _feriados
                .Where(f => f.Data.Year >= anoInicio && f.Data.Year <= anoFim)
                .Select(f => f.Data.Year)
                .Distinct()
                .ToArray());
    }

    public Task UpsertRangeAsync(
        IReadOnlyCollection<FeriadoNacional> feriados,
        CancellationToken cancellationToken)
    {
        _feriados.AddRange(feriados);
        return Task.CompletedTask;
    }
}
