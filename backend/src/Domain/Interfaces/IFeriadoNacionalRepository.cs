using PainelObrigacoes.Domain.Entities;

namespace PainelObrigacoes.Domain.Interfaces;

public interface IFeriadoNacionalRepository
{
    Task<IReadOnlyCollection<FeriadoNacional>> GetByPeriodoAsync(
        DateTime inicio,
        DateTime fim,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<int>> GetAnosComCacheAsync(
        int anoInicio,
        int anoFim,
        CancellationToken cancellationToken);

    Task UpsertRangeAsync(
        IReadOnlyCollection<FeriadoNacional> feriados,
        CancellationToken cancellationToken);
}
