using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Application.Tests;

internal sealed class FakeObrigacaoRepository : IObrigacaoRepository
{
    private readonly List<Obrigacao> _obrigacoes = [];

    public IReadOnlyCollection<Obrigacao> Obrigacoes => _obrigacoes;

    public Task AddRangeAsync(IEnumerable<Obrigacao> obrigacoes, CancellationToken cancellationToken)
    {
        _obrigacoes.AddRange(obrigacoes);
        return Task.CompletedTask;
    }

    public Task<Obrigacao?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return Task.FromResult(_obrigacoes.FirstOrDefault(o => o.Id == id));
    }

    public Task<IReadOnlyCollection<Obrigacao>> GetCalendarioAsync(
        Guid? empresaId,
        Competencia? competencia,
        StatusObrigacao? status,
        CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<Obrigacao>>(_obrigacoes);
    }

    public Task<IReadOnlyCollection<Obrigacao>> GetAlertasAsync(
        DateTime dataAtual,
        DateTime dataLimite,
        CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<Obrigacao>>(
            _obrigacoes
                .Where(o => o.Status != StatusObrigacao.Entregue)
                .Where(o => o.DataVencimento.Date <= dataLimite.Date)
                .OrderBy(o => o.DataVencimento)
                .ToArray());
    }

    public Task<IReadOnlyCollection<Obrigacao>> GetByVencimentoAsync(
        Guid? empresaId,
        DateTime? inicio,
        DateTime? fimExclusivo,
        CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<Obrigacao>>(
            _obrigacoes
                .Where(o => empresaId is null || o.EmpresaId == empresaId.Value)
                .Where(o => inicio is null || o.DataVencimento >= inicio.Value)
                .Where(o => fimExclusivo is null || o.DataVencimento < fimExclusivo.Value)
                .ToArray());
    }

    public Task<IReadOnlyCollection<Obrigacao>> GetByCompetenciaAsync(
        Competencia competencia,
        CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<Obrigacao>>(
            _obrigacoes
                .Where(o => o.CompetenciaAno == competencia.Ano && o.CompetenciaMes == competencia.Mes)
                .ToArray());
    }

    public Task<IReadOnlyCollection<Obrigacao>> GetByEmpresaEPeriodoAsync(
        Guid empresaId,
        Competencia inicio,
        Competencia fim,
        CancellationToken cancellationToken)
    {
        return Task.FromResult<IReadOnlyCollection<Obrigacao>>(
            _obrigacoes
                .Where(o => o.EmpresaId == empresaId)
                .Where(o => o.Competencia.CompareTo(inicio) >= 0 && o.Competencia.CompareTo(fim) <= 0)
                .ToArray());
    }

    public Task AddEntregaAsync(Entrega entrega, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
