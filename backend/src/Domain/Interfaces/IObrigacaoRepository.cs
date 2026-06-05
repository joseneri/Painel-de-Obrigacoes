using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Domain.Interfaces;

public interface IObrigacaoRepository
{
    Task AddRangeAsync(IEnumerable<Obrigacao> obrigacoes, CancellationToken cancellationToken);

    Task<Obrigacao?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<Obrigacao>> GetCalendarioAsync(
        Guid? empresaId,
        Competencia? competencia,
        StatusObrigacao? status,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<Obrigacao>> GetAlertasAsync(
        DateTime dataAtual,
        DateTime dataLimite,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<Obrigacao>> GetByCompetenciaAsync(
        Competencia competencia,
        CancellationToken cancellationToken);

    Task AddEntregaAsync(Entrega entrega, CancellationToken cancellationToken);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}

